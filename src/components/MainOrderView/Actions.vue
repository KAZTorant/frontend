    <template>
      <Teleport to="body">
        <div class="loading-overlay" v-if="isLoading">
          <PrinterLoading  />
        </div>
      </Teleport>
      
      <div class="actions">
        <button 
          class="action-button" 
          v-for="action in filteredActions" 
          :key="action.id" 
          @click="handleAction(action.method, action.id)" 
          :data-method="action.method" 
          :data-id="action.id" 
          :class="{ 'green-button': action.method === 'printOrder' && buttonColor === '#74E291' }"
        >
          {{ action.label }}
        </button>

        <!-- Error and Success popups -->
        <ErrorPopup v-if="error" :error-message="error" @close="clearError" />
        <SuccessPopup v-if="successMessage" :success-message="successMessage" @close="clearSuccess" />

        <!-- All Modals -->
        <Teleport to="body">
          <!-- Confirmation Dialog -->
          <div v-if="showConfirmation" class="modal-container">
            <div class="modal-overlay"></div>
            <div v-if="loading">
              <PrinterLoading />
            </div>
            <div class="confirmation-dialog" v-if="!loading">
              <div class="confirmation-message">
                <div>
                  <label class="label">Ümumi məbləğ ₼</label>
                  <input
                    type="text"
                    :value="'₼ ' + total_price"
                    readonly
                    placeholder="Miqdar"
                    class="input amount-input"
                  />
                </div>
                <div>
                  <label class="label">Son məbləğ ₼</label>
                  <input
                    type="text"
                    :value="'₼ ' + (total_price - discount_amount).toFixed(2).replace(/\.00$/, '')"
                    readonly
                    placeholder="Miqdar"
                    class="input amount-input"
                  />
                </div>
                <div>
                  <label class="label">Cəmi ödəniş (₼)</label>
                  <input
                    type="text"
                    :value="'₼ ' + totalPaidAmount.toFixed(2).replace(/\.00$/, '')"
                    readonly
                    class="input amount-input total-amount"
                  />
                </div>
                <div>
                  <label class="label">Qalıq məbləğ ₼</label>
                  <input
                    type="text"
                    :value="'₼ ' + (totalPaidAmount - (total_price - discount_amount)).toFixed(2).replace(/\.00$/, '')"
                    readonly
                    placeholder="Miqdar"
                    class="input amount-input"
                  />
                </div>
              </div>

              <div class="modal-form hall">
                <!-- Payment Amounts Section -->
                <div class="payment-amounts-section">
                  <!-- Payment Type Labels -->
                  <div class="payment-labels-row">
                    <div class="payment-column">
                      <span class="payment-label">Nagd</span>
                    </div>
                    <div class="payment-column">
                      <span class="payment-label">Kart</span>
                    </div>
                    <div class="payment-column">
                      <span class="payment-label">Diger</span>
                    </div>
                  </div>

                  <!-- Payment Input Row -->
                  <div class="payment-inputs-row">
                    <div class="payment-column">
                      <input
                        type="text"
                        v-model="paymentAmounts.cash"
                        readonly
                        placeholder="₼0"
                        @click.stop="activatePaymentInput('cash')"
                        :class="{ active: activePaymentInput === 'cash' }"
                        class="input amount-input"
                      />
                    </div>
                    <div class="payment-column">
                      <input
                        type="text"
                        v-model="paymentAmounts.card"
                        readonly
                        placeholder="₼0"
                        @click.stop="activatePaymentInput('card')"
                        :class="{ active: activePaymentInput === 'card' }"
                        class="input amount-input"
                      />
                    </div>
                    <div class="payment-column">
                      <input
                        type="text"
                        v-model="paymentAmounts.other"
                        readonly
                        placeholder="₼0"
                        @click.stop="activatePaymentInput('other')"
                        :class="{ active: activePaymentInput === 'other' }"
                        class="input amount-input"
                      />
                    </div>
                  </div>

                  <!-- Payment Button Row -->
                  <div class="payment-buttons-row">
                    <div class="payment-column">
                      <button 
                        v-if="getButtonTextForType('cash')" 
                        class="fill-button" 
                        @click="fillPaymentWithRemaining('cash')"
                      >
                        {{ getButtonTextForType('cash') }}
                      </button>
                    </div>
                    <div class="payment-column">
                      <button 
                        v-if="getButtonTextForType('card')" 
                        class="fill-button" 
                        @click="fillPaymentWithRemaining('card')"
                      >
                        {{ getButtonTextForType('card') }}
                      </button>
                    </div>
                    <div class="payment-column">
                      <button 
                        v-if="getButtonTextForType('other')" 
                        class="fill-button" 
                        @click="fillPaymentWithRemaining('other')"
                      >
                        {{ getButtonTextForType('other') }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Payment Numpad -->
                <div ref="paymentNumpadContainer" class="payment-numpad-container">
                  <transition name="fade-slide">
                    <div v-if="showPaymentNumpad" class="numpad-buttons">
                      <button v-for="n in 4" :key="n" @click="appendToPaymentAmount(n)">
                        {{ n }}
                      </button>
                      <button v-for="n in 4" :key="n+4" @click="appendToPaymentAmount(n+4)">
                        {{ n+4 }}
                      </button>
                      <button @click="appendToPaymentAmount(9)">9</button>
                      <button @click="appendToPaymentAmount('.')">.</button>
                      <button @click="appendToPaymentAmount(0)">0</button>
                      <button @click="deleteLastDigitFromPayment">
                        <font-awesome-icon icon="arrow-left" />
                      </button>
                      <button @click="clearPaymentAmount">x</button>
                      <button @click="closeNumpad" class="close-numpad-btn">
                        <font-awesome-icon icon="times" />
                      </button>
                    </div>
                  </transition>
                </div>

                <div ref="discountNumpadContainer" class="discount-group">
                  <div class="input-container">
                    
                    <div>
                      <label class="label">Endirim Faizi %</label>
                      <input
                        type="text"
                        v-model="discountPercentInput"
                        readonly
                        placeholder="0 %"
                        @click="activateDiscountInput('percent')"
                        :class="{ active: activeDiscountInput === 'percent'}"
                        class="input"
                      />
                    </div>
                    <div>
                      <label class="label">Endirim Miqdari ₼</label>
                      <input
                        type="text"
                        v-model="discountAmountInput"
                        readonly
                        placeholder="0 ₼"
                        class="input amount-input"
                        :class="{ active: activeDiscountInput === 'amount' }"
                        @click="activateDiscountInput('amount')"
                      />
                    </div>
                    
                  </div>

                  <transition name="fade-slide">
                    <div v-if="showDiscountNumpad" class="numpad-buttons">
                      <button v-for="n in 9" :key="n" @click="appendToDiscountPercent(n)">
                        {{ n }}
                      </button>
                      <button @click="appendToDiscountPercent('.')">.</button>
                      <button @click="appendToDiscountPercent(0)">0</button>
                      <button @click="deleteLastDigitFromDiscount">
                        <font-awesome-icon icon="arrow-left" />
                      </button>
                      <button @click="clearDiscountPercent">x</button>
                    </div>
                  </transition>
                </div>

                <label>
                  Endirim səbəbi və ya qeydi
                  <input type="text" v-model="discount_comment" placeholder="Səbəb yazın..." @click="showVirtualKeyboard($event)" />
                </label>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmAction" :disabled="loading">Təsdiqlə</button>
                <button class="cancel-btn" @click="cancelAction">Ləgv et</button>
              </div>
            </div>
          </div>

          <!-- Transfer Modal -->
          <div v-if="showTransferModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Masanı köçür</h2>
              <div class="modal-content-main hall">
                <div>
                  <label for="hall">Zal Seç:</label>
                  <select id="hall" v-model="selectedHall" @change="fetchTablesForHall">
                    <option v-for="hall in halls" :key="hall.id" :value="hall.id">{{ hall.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="table">Masa seç:</label>
                  <select id="table" v-model="selectedTable">
                    <option v-for="table in tables" :key="table.id" :value="table.id">{{ table.number }}</option>
                  </select>
                </div>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmTransfer">Təsdiqlə</button>
                <button class="cancel-btn" @click="cancelTransfer">Ləğv et</button>
              </div>
            </div>
          </div>

          <!-- Waitress Change Modal -->
          <div v-if="showWaitressModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Ofsianti dəyiş</h2>
              <div class="modal-content-main">
                <label for="waitress">Ofsiant seç:</label>
                <select id="waitress" class="waitress" v-model="selectedWaitress">
                  <option v-for="waitress in waitresses" :key="waitress.id" :value="waitress.id">
                    {{ waitress.full_name }}
                  </option>
                </select>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmWaitressChange">Təsdiqlə</button>
                <button class="cancel-btn" @click="cancelWaitressChange">Ləğv et</button>
              </div>
            </div>
          </div>

          <!-- Combine Modal -->
          <div v-if="showCombineModal" class="modal-container">
            <div class="modal-overlay"></div>
            <div class="confirmation-dialog">
              <h2 class="modal-title">Masanı birləşdir</h2>
              <div class="modal-content-main hall">
                <div>
                  <label for="combine-hall">Zal Seç:</label>
                  <select id="combine-hall" v-model="selectedHall" @change="fetchTablesForCombine">
                    <option v-for="hall in halls" :key="hall.id" :value="hall.id">{{ hall.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="combine-table">Masa seç:</label>
                  <select id="combine-table" v-model="selectedTable">
                    <option v-for="table in tables" :key="table.id" :value="table.id">{{ table.number }}</option>
                  </select>
                </div>
              </div>
              <div class="confirmation-buttons">
                <button class="confirm-btn" @click="confirmCombine">Birləşdir</button>
                <button class="cancel-btn" @click="cancelCombine">Ləğv et</button>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

       <!-- Virtual Keyboard Component -->
    <Teleport to="body">
        <div class="keyboard-container">
            <VirtualKeyboard 
            :isVisible="showKeyboard" 
            :targetElement="activeTextarea"
            @hide-keyboard="hideVirtualKeyboard"
        />
        </div>
    </Teleport>

    </template>

    <script>
    import ErrorPopup from '@/components/ErrorPopup.vue';
    import SuccessPopup from '@/components/SuccessPopup.vue';
    import backendServices from '@/backend-services/backend-services';
    import router from '@/router/';
    import { library } from '@fortawesome/fontawesome-svg-core';
    import { faPrint, faUser, faExchangeAlt, faTimes, faUtensils, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
    import { EventBus } from '@/EventBus';
    import PrinterLoading from '@/components/PrinterLoading.vue';
    import VirtualKeyboard from '@/components/VirtualKeyboard.vue';
    library.add(faPrint, faUser, faExchangeAlt, faTimes, faUtensils, faArrowLeft);

    export default {
      components: {
        ErrorPopup,
        SuccessPopup,
        PrinterLoading,
        VirtualKeyboard
      },
      name: 'Actions',
      props: {
        tableId: {
          type: [Number, String],
          required: true,
          validator: (value) => {
            return !isNaN(Number(value));
          }
        },
        selectedOrderId: {
          type: Number,
          default: null
        },
        role: {
          type: String,
          required: true
        },
      },
      data() {
        return {
          actions: [
            { id: 1, label: 'Hesab Çeki', method: 'printOrder' },
            { id: 5, label: 'Çeki ləğv et', method: 'cancelPrintOrder' },
            { id: 7, label: 'Hazırla', method: 'confirmKitchen', isKitchenButton: true },
            { id: 3, label: 'Ödəniş', method: 'cancelOrder' },
            { id: 2, label: 'Ofsianti dəyiş', method: 'changeWaitress' },
            { id: 4, label: 'Masanı köçür', method: 'openTransferModal' },
            { id: 6, label: 'Masanı birləşdir', method: 'openCombine' },
          ],
          payment_type: 'cash',
          discount_amount: 0,
          discount_percent: 0,
          discount_comment: '',
          paid_amount: 0,
          loading: false,
          isLoading: false,
          activeDiscountInput: '',
          discountAmountInput: '',
          discountPercentInput: '',
          showNumpad: false,
          showDiscountNumpad: false,
          total_price: 0,

          error: null,
          successMessage: null,
          buttonColor: '',
          showConfirmation: false,
          showTransferModal: false,
          showWaitressModal: false,
          showCombineModal: false,
          selectedHall: null,
          selectedTable: null,
          selectedWaitress: null,
          halls: [],
          tables: [],
          waitresses: [],
          orderItemAddedHandler: null,
          // Virtual keyboard related data
          showKeyboard: false,
          activeTextarea: null,
          // New payment system data
          paymentAmounts: {
            cash: 0,
            card: 0,
            other: 0
          },
          activePaymentInput: 'cash',
          showPaymentNumpad: false
        };
      },
      computed: {
        filteredActions() {
          if (this.role === 'admin' || this.role === 'restaurant') {
            return this.actions;
          } else if (this.role === 'waitress') {
            return this.actions.filter(action => (action.id === 7 || action.id === 1));
          }
          return [];
        },
        totalPaidAmount() {
          return parseFloat(this.paymentAmounts.cash || 0) + 
                 parseFloat(this.paymentAmounts.card || 0) + 
                 parseFloat(this.paymentAmounts.other || 0);
        }
      },
      async mounted() {
  if (this.role !== 'waitress') {
    await this.fetchTableDetailsAndUpdateButtonColor();
    await this.fetchHalls();
    await this.fetchTablesForHall();
    await this.fetchTablesForCombine();
    await this.fetchWaitresses();
  }
  document.addEventListener('click', this.handleClickOutsideDiscount);
  document.addEventListener('click', this.handleClickOutsidePaid);
  
  // Store the handler function reference
  this.orderItemAddedHandler = () => {
    this.fetchTableDetailsAndUpdateButtonColor();
  };
  
  // Use the stored reference
  EventBus.on('orderItemAdded', this.orderItemAddedHandler);
},
      
beforeUnmount() {
  document.removeEventListener('click', this.handleClickOutsideDiscount);
  document.removeEventListener('click', this.handleClickOutsidePaid);
  
  // Use the same reference to unsubscribe
  EventBus.off('orderItemAdded', this.orderItemAddedHandler);
},

      methods: {
        // Virtual keyboard methods
        showVirtualKeyboard(event) {
        // Set the active textarea to the one that was clicked
          this.activeTextarea = event.target;
          this.showKeyboard = true;
        },
        
        hideVirtualKeyboard() {
          this.showKeyboard = false;
          this.activeTextarea = null;
        },
        // Data fetching methods
        async fetchTableDetailsAndUpdateButtonColor() {
          try {
            const tableResponse = await backendServices.fetchTableDetails(this.tableId);
            this.buttonColor = tableResponse.print_check ? '#74E291' : '';
            this.total_price = tableResponse.total_price; 
          } catch (error) {
            console.error('Error fetching table details:', error);
            this.showError('Error fetching table details. Please try again later.');
          }
        },
        async fetchTablesForCombine() {
          if (!this.selectedHall) return;
          try {
            const tables = await backendServices.fetchTablesByHallId(this.selectedHall);
            this.tables = tables.filter(table => {
              return Number(table.id) !== Number(this.tableId) && table.waitress && table.waitress.id !== 0;
            });

            if (this.tables.length > 0) {
              this.selectedTable = this.tables[0].id;
            }
          } catch (error) {
            console.error('Error fetching tables:', error);
            this.showError('Error fetching tables. Please try again later.');
          }
        },

        async fetchHalls() {
          try {
            this.halls = await backendServices.fetchRooms();
            if (this.halls.length > 0) {
              this.selectedHall = this.halls[0].id;
              await this.fetchTablesForHall();
            }
          } catch (error) {
            console.error('Error fetching halls:', error);
            this.showError('Error fetching halls. Please try again later.');
          }
        },

        async fetchTablesForHall() {
          if (!this.selectedHall) return;
          try {
            const tables = await backendServices.fetchTablesByHallId(this.selectedHall);
            this.tables = tables.filter(table => table.waitress.id === 0);
            if (this.tables.length > 0) {
              this.selectedTable = this.tables[0].id;
            }
          } catch (error) {
            console.error('Error fetching tables:', error);
            this.showError('Error fetching tables. Please try again later.');
          }
        },

        async fetchWaitresses() {
          try {
            this.waitresses = await backendServices.fetchWaitresses();
            if (this.waitresses.length > 0) {
              this.selectedWaitress = this.waitresses[0].id;
            }
          } catch (error) {
            console.error('Error fetching waitresses:', error);
            this.showError('Error fetching waitresses. Please try again later.');
          }
        },

        async handleAction(methodName, actionId) {
          if ((this.role === 'waitress' || this.role === 'captain_waitress') && !(actionId === 1 || actionId === 7)) {
            return;
          }

          if (actionId === 1 || actionId === 5 || actionId === 7) {
            this.isLoading = true;
          }
          switch(methodName) {
            case 'openTransferModal':
              this.showTransferDialog();
              break;
            case 'cancelOrder':
              this.showConfirmationDialog();
              break;
            case 'changeWaitress':
              this.showWaitressDialog();
              break;
            case 'openCombine':
              this.showCombineDialog();
              break;
            case 'printOrder':
              await this.callPrintOrder(this.tableId, actionId);
              break;
            case 'cancelPrintOrder':
              await this.callCanelPrintOrder(this.tableId, actionId);
              break;
              case 'confirmKitchen':
                this.isLoading = true;
                try {
                  await backendServices.confirmOrder(this.tableId);
                  this.showSuccess('Sifariş mətbəxə göndərildi.');
                  this.$emit('order-confirmed');
                } catch (error) {
                  console.error('Error confirming order:', error);
                  if (error.code === 'ECONNABORTED') {
                    this.showError('Server cavab vermir. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
                  } else {
                    this.showError('Sifarişi mətbəxə göndərmək mümkün olmadı.');
                  }
                } finally {
                  if (actionId === 7) {
                    this.isLoading = false;
                  }
                }
              break;
          }
        },

        async callPrintOrder(tableId, actionId) {
          this.isLoading = true;

          try {
            await backendServices.printCheck(tableId);
            this.showSuccess('Çek print olundu.');
            await this.fetchTableDetailsAndUpdateButtonColor();
          } catch (error) {
            console.error('Error printing check:', error);
            this.showError('Çek print olunub artıq.');
          } finally {
            if (actionId === 1) {
              this.isLoading = false;
            }
          }
        },

        async callCanelPrintOrder(tableId, actionId) {
          this.isLoading = true;
          try {
            await backendServices.deleteCheck(tableId);
            this.showSuccess('Çek leğv olundu.');
            await this.fetchTableDetailsAndUpdateButtonColor();
          } catch (error) {
            console.error('Error cancelling check:', error);
            this.showError('Çeki ləğv etmədə problem yarandı.');
          } finally {
            if (actionId === 5) {
              this.isLoading = false;
            }
          }
        },

        showError(errorMessage) {
          this.error = errorMessage;
        },

        clearError() {
          this.error = null;
        },

        showSuccess(successMessage) {
          this.successMessage = successMessage;
        },

        clearSuccess() {
          this.successMessage = null;
        },

        // Modal show methods
        showConfirmationDialog() {
          this.showConfirmation = true;
          this.fetchTableDetailsAndUpdateButtonColor();
          this.resetForm()
        },

        showTransferDialog() {
          this.showTransferModal = true;
          this.fetchHalls();
        },

        showWaitressDialog() {
          this.showWaitressModal = true;
          this.fetchWaitresses();
        },

        showCombineDialog() {
          this.showCombineModal = true;
          this.fetchTablesForCombine();
        },

        // Modal cancel methods
        cancelAction() {
          this.resetForm();
          this.fetchTableDetailsAndUpdateButtonColor();
          this.showConfirmation = false;
        },

        cancelTransfer() {
          this.showTransferModal = false;
        },

        cancelWaitressChange() {
          this.showWaitressModal = false;
        },

        cancelCombine() {
          this.showCombineModal = false;
        },

        // Modal confirm methods
        resetForm() {
          this.discount_amount = 0;
          this.discount_comment = '';
          this.discountPercentInput = 0;
          this.discountAmountInput = 0;
          this.showDiscountNumpad = false;
          this.paymentAmounts = {
            cash: 0,
            card: 0,
            other: 0
          };
          this.activePaymentInput = 'cash';
          this.showPaymentNumpad = false;
        },

        async confirmAction() {
          this.loading = true;

          // Build payment_methods array from payment types with non-zero amounts
          const payment_methods = [];
          ['cash', 'card', 'other'].forEach(type => {
            const amount = parseFloat(this.paymentAmounts[type]) || 0;
            if (amount > 0) {
              payment_methods.push({
                payment_type: type,
                amount: amount
              });
            }
          });

          const payload = {
            payment_methods: payment_methods,
            paid_amount: this.totalPaidAmount,
            discount_amount: this.discount_amount,
            discount_comment: this.discount_comment
          };

          try {
            await backendServices.cancelPayment(this.tableId, payload);
            router.back();
          } catch (error) {
            console.error('Xəta baş verdi:', error);
            this.showError('Masa bağlanarkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.');
          }  finally {
            this.loading = false;
          }

          this.showConfirmation = false;
        },
        
        appendToPaymentAmount(num) {
          if (num === '.' && String(this.paymentAmounts[this.activePaymentInput]).includes('.')) {
            return;
          }

          if (this.paymentAmounts[this.activePaymentInput] === 0 || this.paymentAmounts[this.activePaymentInput] === '') {
            if (num === '.') {
              this.paymentAmounts[this.activePaymentInput] = '0.';
            } else {
              this.paymentAmounts[this.activePaymentInput] = num.toString();
            }
          } else {
            this.paymentAmounts[this.activePaymentInput] = this.paymentAmounts[this.activePaymentInput].toString() + num.toString();
          }
        },
        deleteLastDigitFromPayment() {
          let paymentStr = this.paymentAmounts[this.activePaymentInput].toString();

          if (paymentStr.length > 0) {
            paymentStr = paymentStr.slice(0, -1);
          }
          
          if (paymentStr === '' || paymentStr === '0.') {
            this.paymentAmounts[this.activePaymentInput] = 0;
          } else {
            this.paymentAmounts[this.activePaymentInput] = paymentStr;
          }
        },
        clearPaymentAmount() {
          this.paymentAmounts[this.activePaymentInput] = 0;
        },

        activateDiscountInput(type) {
          this.activeDiscountInput = type;
          this.showDiscountNumpad = true;
          
          if (type === 'percent') {
            this.discountPercentInput = this.discount_percent > 0 ? this.discount_percent.toString() : '';
          } else if (type === 'amount') {
            this.discountAmountInput = this.discount_amount > 0 ? this.discount_amount.toString() : '';
          }
        },

        appendToDiscountPercent(num) {
          if (num === '.' && this.activeDiscountInput === 'percent' && this.discountPercentInput.includes('.')) return;
          if (num === '.' && this.activeDiscountInput === 'amount' && this.discountAmountInput.includes('.')) return;
          
          if (this.activeDiscountInput === 'percent') {

            if (this.discountPercentInput === '0' && num !== '.') {
              this.discountPercentInput = '';
            }
            
            this.discountPercentInput += num.toString();
            this.discount_percent = parseFloat(this.discountPercentInput) || 0;

            if (this.discount_percent > 100) {
              this.discount_percent = 100;
              this.discountPercentInput = '100';
            }

            this.calculateAmountFromPercent();
          } else if (this.activeDiscountInput === 'amount') {

            if (this.discountAmountInput === '0' && num !== '.') {
              this.discountAmountInput = '';
            }
            
            this.discountAmountInput += num.toString();
            this.discount_amount = parseFloat(this.discountAmountInput) || 0;

            if (this.discount_amount > this.total_price) {
              this.discount_amount = this.total_price;
              this.discountAmountInput = this.discount_amount.toString();
            }

            this.calculatePercentFromAmount();
          }
        },

        calculateAmountFromPercent() {
          if (this.discount_percent && this.total_price) {
            if (this.discount_percent > 100) {
              this.discount_percent = 100;
            }
            
            const amount = (this.total_price * this.discount_percent) / 100;

            if (amount > this.total_price) {
              this.discount_amount = this.total_price;
            } else {
              this.discount_amount = parseFloat(amount.toFixed(2));
            }

            this.discountAmountInput = this.discount_amount.toFixed(2);
          }
        },

        calculatePercentFromAmount() {
          if (this.discount_amount && this.total_price) {
            if (this.discount_amount > this.total_price) {
              this.discount_amount = this.total_price;
              this.discountAmountInput = this.discount_amount.toFixed(2);
            }

            const percent = (this.discount_amount / this.total_price) * 100;
            this.discount_percent = parseFloat(percent.toFixed(2));
            this.discountPercentInput = this.discount_percent.toString();
          }
        },

        deleteLastDigitFromDiscount() {
          if (this.activeDiscountInput === 'percent') {
            if (this.discountPercentInput.length <= 1) {
              this.discountPercentInput = '';
              this.discount_percent = 0;
              this.discount_amount = 0;
              this.discountAmountInput = '';
            } else {
              this.discountPercentInput = this.discountPercentInput.slice(0, -1);
              this.discount_percent = parseFloat(this.discountPercentInput) || 0;
              this.calculateAmountFromPercent();
            }
          } else if (this.activeDiscountInput === 'amount') {
            if (this.discountAmountInput.length <= 1) {
              this.discountAmountInput = '';
              this.discount_amount = 0;
              this.discount_percent = 0;
              this.discountPercentInput = '';
            } else {
              this.discountAmountInput = this.discountAmountInput.slice(0, -1);
              this.discount_amount = parseFloat(this.discountAmountInput) || 0;
              this.calculatePercentFromAmount();
            }
          }
        },

        clearDiscountPercent() {
          this.discountPercentInput = '';
          this.discountAmountInput = '';
          this.discount_percent = 0;
          this.discount_amount = 0;
        },

        fillPaymentWithRemaining(type) {
          const remainingAmount = this.getRemainingAmountForType(type);
          
          let formattedRemaining = remainingAmount.toFixed(2);

          if (formattedRemaining.endsWith('.00')) {
            formattedRemaining = formattedRemaining.slice(0, -3);
          } else if (formattedRemaining.endsWith('0')) {
            formattedRemaining = formattedRemaining.slice(0, -1);
          }
          
          this.paymentAmounts[type] = formattedRemaining;
        },

        getRemainingAmountForType(type) {
          const finalPrice = this.total_price - this.discount_amount;
          const currentTotalPaid = this.totalPaidAmount;
          const currentTypeAmount = parseFloat(this.paymentAmounts[type]) || 0;
          
          // Calculate remaining amount excluding current payment type
          const otherPaymentsTotal = currentTotalPaid - currentTypeAmount;
          const remaining = finalPrice - otherPaymentsTotal;
          
          return Math.max(0, remaining);
        },

        handleClickOutsideDiscount(event) {
          const numpad = this.$refs.discountNumpadContainer;
          if (numpad && !numpad.contains(event.target)) {
            this.showDiscountNumpad = false;
          }
        },
        
        handleClickOutsidePaid(event) {
          const paymentNumpad = this.$refs.paymentNumpadContainer;
          const paymentSection = document.querySelector('.payment-amounts-section');
          
          // Don't close if clicking on payment inputs or numpad
          if (paymentNumpad && !paymentNumpad.contains(event.target) && 
              paymentSection && !paymentSection.contains(event.target)) {
            this.showPaymentNumpad = false;
          }
        },

        async confirmTransfer() {
          if (this.selectedHall && this.selectedTable) {
            try {
              await backendServices.changeTableForOrder(this.tableId, this.selectedTable);
              this.showTransferModal = false;
              router.back();
            } catch (error) {
              console.error('Error changing table:', error);
              this.showError('Error changing table. Please try again later.');
            }
          }
        },

        async confirmWaitressChange() {
          if (this.selectedWaitress) {
            try {
              await backendServices.changeWaitressForOrder(this.tableId, this.selectedWaitress);
              this.showWaitressModal = false;
              router.back();
            } catch (error) {
              console.error('Error changing waitress:', error);
              this.showError('Error changing waitress. Please try again later.');
            }
          }
        },

        async confirmCombine() {
          if (this.selectedTable) {
            try {
              await backendServices.combineTables(this.tableId, [this.selectedTable]);
              this.showCombineModal = false;
              router.back();
            } catch (error) {
              console.error('Error combining tables:', error);
              this.showError('Error combining tables. Please try again later.');
            }
          }
        },

        activatePaymentInput(type) {
          this.activePaymentInput = type;
          
          // Ensure the payment amount is initialized
          if (this.paymentAmounts[type] === undefined || this.paymentAmounts[type] === null) {
            this.paymentAmounts[type] = 0;
          }
          
          // Use nextTick to ensure proper DOM update
          this.$nextTick(() => {
            this.showPaymentNumpad = true;
          });
        },

        getButtonTextForType(type) {
          const finalPrice = this.total_price - this.discount_amount; // Son məbləğ ₼
          const currentTotalPaid = this.totalPaidAmount; // Cəmi ödəniş (₼)
          const currentTypeAmount = parseFloat(this.paymentAmounts[type]) || 0;
          const otherPaymentsTotal = currentTotalPaid - currentTypeAmount;
          const remainingToPay = finalPrice - otherPaymentsTotal;
          
          // No button if already paid in full or overpaid
          if (remainingToPay <= 0) {
            return null;
          }
          
          // Show "Tam" if no other payments have been made (first payment for full amount)
          if (otherPaymentsTotal === 0) {
            return 'Tam';
          }
          
          // Show "Qaliq" if there are other payments and still remaining amount to pay
          if (otherPaymentsTotal > 0 && remainingToPay > 0) {
            return 'Qaliq';
          }
          
          return null;
        },

        closeNumpad() {
          this.showPaymentNumpad = false;
          this.activePaymentInput = null;
        },
      }
    };
    </script>

<style scoped>
.keyboard-container {
  position: fixed;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999999;
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4); /* arxa fon yarı şəffaf */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.actions {
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
}

.action-button {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  height: 58px;
  padding: 15px 20px;
  font-weight: 600;
  color: #fff;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-button[data-id="1"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="1"]:hover {
  background-color: #43a047 !important;
}

.action-button[data-id="2"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="2"]:hover {
  background-color: #43a047 !important;
}

.action-button[data-id="3"] {
  background-color: #d32f2f !important;
}
.action-button[data-id="3"]:hover {
  background-color: #c62828 !important;
}

.action-button[data-id="4"] {
  background-color: #2196f3 !important;
}
.action-button[data-id="4"]:hover {
  background-color: #1e88e5 !important;
}

.action-button[data-id="5"] {
  background-color: #ff9800 !important;
}
.action-button[data-id="5"]:hover {
  background-color: #fb8c00 !important;
}

.action-button[data-id="6"] {
  background-color: #9c27b0 !important;
}
.action-button[data-id="6"]:hover {
  background-color: #8e24aa !important;
}

.action-button[data-id="7"] {
  background-color: #4caf50 !important;
}
.action-button[data-id="7"]:hover {
  background-color: #43a047 !important;
}

.green-button {
  background-color: #74E291 !important;
}

/* Modal styles */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.confirmation-dialog {
  position: relative;
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  border: 2px solid #2ecc71;
  text-align: center;
  min-width: 700px;
  max-width: 800px;
  z-index: 99999999;
}

.confirmation-message {
  max-width: 650px;
  width: 100%;
  margin: 0 auto 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  gap: 10px;
}

.confirmation-message > div {
  display: flex;
  flex-direction: column;
}

.confirmation-message label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.confirmation-message .input {
  max-width: 140px;
  width: 100%;
  padding: 10px;
  border: 1px solid #2ecc71;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9f9f9;
  text-align: center;
  color: #222;
}

.confirmation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.confirm-btn,
.cancel-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  min-width: 120px;
}

.confirm-btn {
  background: #4caf50;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background: #43a047;
}

.cancel-btn {
  background: #f44336;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background: #e53935;
}

.modal-title {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.modal-content-main {
  margin: 20px 0;
}

.modal-content-main label {
  display: block;
  margin-bottom: 10px;
  color: #2c3e50;
}

.modal-content-main select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 15px;
}

/* Cancel Action */
.modal-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.modal-form label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #333;
}

.modal-form input,
.modal-form select {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.discount-group {
  margin-bottom: 16px;
}

.input-button-group {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-button-group input {
  border-radius: 6px 0 0 6px;
}

.fill-button {
  background-color: #4caf50;
  border: none;
  margin-top: 6px;
  height: 38px;
  padding: 10px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.fill-button:hover {
  background-color: #2ecc71;
}

.input-container {
  display: flex;
  gap: 20px;
}

.input-container div {
  flex: 1;
}

.input-container .label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  font-size: 14px;
  color: #333;
}

.input-container .input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  text-align: center;
  outline: none;
}

.input.active {
  border: 1px solid #2ecc71;
}

.amount-input {
  color: green;
  font-weight: bold;
}

/* Payment Amounts Section */
.payment-amounts-section {
  margin-bottom: 20px;
}

.payment-labels-row {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.payment-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  text-align: center;
}

.payment-inputs-row {
  display: flex;
  gap: 10px;
}

.payment-buttons-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.payment-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.payment-column .input {
  width: 100%;
  text-align: center;
}

.payment-column .fill-button {
  background-color: #4caf50;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-top: 5px;
}

.payment-column .fill-button:hover {
  background-color: #2ecc71;
}

/* Payment Numpad Container */
.payment-numpad-container {
  margin-top: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.payment-numpad-container:not(:has(.numpad-buttons)) {
  margin-top: 0;
  height: 0;
}

.numpad-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 300px;
  margin: 8px auto;
}

.numpad-buttons button {
  padding: 15px;
  font-size: 18px;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  height: 50px;
  transition: background-color 0.2s;
}

.numpad-buttons button:hover {
  background-color: #ddd;
}

.close-numpad-btn {
  background-color: #f44336 !important;
  color: white !important;
  grid-column: span 2;
}

.close-numpad-btn:hover {
  background-color: #d32f2f !important;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  height: 0;
  margin: 0;
  padding: 0;
}

.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .actions {
    padding: 10px;
    gap: 8px;
  }

  .action-button {
    min-width: 120px;
    height: 50px;
    padding: 12px 16px;
    font-size: 0.9em;
  }

  .confirmation-dialog {
    min-width: 300px;
    margin: 20px;
    padding: 20px;
  }

  .confirmation-message {
    font-size: 1.2em;
  }

  .confirm-btn,
  .cancel-btn {
    padding: 10px 20px;
    font-size: 1em;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .action-button {
    min-width: 110px;
    height: 45px;
    padding: 10px 14px;
    font-size: 0.8em;
  }
}
</style>
