import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight, Smartphone, Copy, Check, QrCode } from 'lucide-react';
import { CartItem, Order, ShippingAddress } from '../types';
import { getApiUrl } from '../config/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customerEmail?: string;
  customerMobile?: string;
  customerName?: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  customerEmail = '',
  customerMobile = '',
  customerName = '',
  onOrderSuccess,
}) => {
  // Form State
  const [fullName, setFullName] = useState(customerName);
  const [mobile, setMobile] = useState(customerMobile);
  const [email, setEmail] = useState(customerEmail);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pinCode, setPinCode] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'Any UPI'>('GPay');

  // Order Placement & UPI Workflow States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'ADDRESS_PAYMENT' | 'UPI_VERIFY' | 'CONFIRMED'>('ADDRESS_PAYMENT');
  const [utrInput, setUtrInput] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 999 ? 0 : 70;
  const totalAmount = subtotal + deliveryCharge;

  const targetUpiNumber = '7989163216';
  const targetUpiId = '7989163216@ybl';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(targetUpiNumber);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Step 1: Trigger UPI Redirect / App Launch
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !mobile.trim() || !streetAddress.trim() || !city.trim() || !pinCode.trim()) {
      setErrorMessage('Please fill in all mandatory shipping address fields.');
      return;
    }

    if (mobile.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Move to UPI Verification Step
    setPaymentStep('UPI_VERIFY');
  };

  // Deep Link URI for UPI Apps
  const getUpiDeepLink = () => {
    const note = encodeURIComponent(`BORAN TRENDS Order for ${fullName.substring(0, 15)}`);
    return `upi://pay?pa=${targetUpiId}&pn=BORAN%20TRENDS%20MENS%20WEAR&am=${totalAmount}&cu=INR&tn=${note}`;
  };

  // Launch App Deep Link directly
  const handleLaunchApp = () => {
    const deepLink = getUpiDeepLink();
    window.location.href = deepLink;
  };

  // Step 2: Verify UTR and Finalize Order Creation on Backend
  const handleVerifyUtrAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUtr = utrInput.trim();
    if (!cleanUtr) {
      setErrorMessage('Please enter the 12-digit UTR / UPI Transaction Reference ID from your payment app receipt.');
      return;
    }

    if (cleanUtr.length < 8) {
      setErrorMessage('Invalid UTR / UPI Transaction ID. Please enter the full 12-digit Reference Number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        colour: item.selectedColour,
      }));

      const shippingAddressObj: ShippingAddress = {
        fullName,
        mobile,
        email,
        streetAddress,
        city,
        state,
        pinCode,
      };

      const payload = {
        customerName: fullName,
        mobile,
        email,
        shippingAddress: shippingAddressObj,
        items: orderItems,
        paymentMethod: selectedUpiApp,
        upiNumber: targetUpiNumber,
        utrNumber: cleanUtr,
      };

      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify and place order.');
      }

      setConfirmedOrder(data.order);
      setPaymentStep('CONFIRMED');
      onOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
              BORAN TRENDS MEN'S WEAR
            </span>
            <h2 className="text-xl font-black text-white uppercase">
              {paymentStep === 'CONFIRMED' ? 'ORDER CONFIRMED 🎉' : 'SECURE CHECKOUT & UPI PAYMENT'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* STEP 1: Address & Shipping Form */}
        {paymentStep === 'ADDRESS_PAYMENT' && (
          <form onSubmit={handleInitiatePayment} className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Delivery Address */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                  1. Delivery Address
                </h3>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="optional@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Street Address / House No. *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House No., Building Name, Street, Landmark"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="PIN"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Order Items & Payment Method */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                    2. Select UPI Payment Method
                  </h3>

                  <div className="mt-3 space-y-2">
                    {/* Google Pay */}
                    <div
                      onClick={() => setSelectedUpiApp('GPay')}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedUpiApp === 'GPay'
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 font-black text-white text-xs flex items-center justify-center">
                          GP
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">Google Pay (GPay)</div>
                          <div className="text-[11px] text-zinc-400">Direct Pay to 7013932279</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedUpiApp === 'GPay' ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'}`}>
                        {selectedUpiApp === 'GPay' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                      </div>
                    </div>

                    {/* PhonePe */}
                    <div
                      onClick={() => setSelectedUpiApp('PhonePe')}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedUpiApp === 'PhonePe'
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 font-black text-white text-xs flex items-center justify-center">
                          PE
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">PhonePe UPI</div>
                          <div className="text-[11px] text-zinc-400">Direct Pay to 7013932279</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedUpiApp === 'PhonePe' ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'}`}>
                        {selectedUpiApp === 'PhonePe' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                      </div>
                    </div>

                    {/* Paytm */}
                    <div
                      onClick={() => setSelectedUpiApp('Paytm')}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedUpiApp === 'Paytm'
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500 font-black text-zinc-950 text-xs flex items-center justify-center">
                          PY
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">Paytm UPI</div>
                          <div className="text-[11px] text-zinc-400">Direct Pay to 7013932279</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedUpiApp === 'Paytm' ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'}`}>
                        {selectedUpiApp === 'Paytm' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                      </div>
                    </div>

                    {/* Any UPI Payment */}
                    <div
                      onClick={() => setSelectedUpiApp('Any UPI')}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedUpiApp === 'Any UPI'
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 font-black text-white text-xs flex items-center justify-center">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">Any UPI Payments</div>
                          <div className="text-[11px] text-zinc-400">Cred, BHIM, Amazon Pay, Any Bank App</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedUpiApp === 'Any UPI' ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'}`}>
                        {selectedUpiApp === 'Any UPI' && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                      </div>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Items ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                      <span className="font-semibold text-zinc-200">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Delivery Charge</span>
                      <span className="font-semibold text-emerald-400">
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                      <span>Total Payable</span>
                      <span className="text-blue-400 text-base">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                >
                  <span>PROCEED TO UPI PAYMENT</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: UPI Redirect & UTR / UPI ID Verification Form */}
        {paymentStep === 'UPI_VERIFY' && (
          <form onSubmit={handleVerifyUtrAndPlaceOrder} className="p-8 overflow-y-auto space-y-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center animate-bounce">
              <Smartphone className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase">
                PAY ₹{totalAmount} VIA {selectedUpiApp.toUpperCase()}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Complete your payment using GPay, PhonePe, Paytm or Any UPI app to our official number below:
              </p>
            </div>

            {/* Target Number Highlight Card */}
            <div className="p-5 bg-zinc-900 border border-blue-500/30 rounded-2xl space-y-3">
              <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                OFFICIAL BORAN TRENDS UPI NUMBER
              </div>

              <div className="flex items-center justify-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-xl font-black text-white tracking-widest">{targetUpiNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs hover:bg-blue-500 transition-colors"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy Number'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-400">
                UPI ID: <strong className="text-zinc-200">{targetUpiId}</strong> (Boran Trends)
              </div>

              <button
                type="button"
                onClick={handleLaunchApp}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all"
              >
                OPEN {selectedUpiApp.toUpperCase()} & PAY NOW
              </button>
            </div>

            {/* UTR / UPI Transaction ID Entry Field */}
            <div className="bg-zinc-900/90 p-5 rounded-2xl border border-zinc-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                  Enter UTR / UPI Transaction Ref ID *
                </label>
                <span className="text-[10px] text-zinc-400">12-Digit Ref No.</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                After completing payment in your GPay / PhonePe / Paytm / UPI app, copy the 12-digit UTR/UPI Ref ID from payment details and enter it below to verify:
              </p>
              <input
                type="text"
                required
                placeholder="e.g. 423819204812 or UPI Ref ID"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Verification Submit Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>VERIFYING PAYMENT...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>VERIFY UTR & CONFIRM ORDER</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentStep('ADDRESS_PAYMENT')}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                ← Back to Address Details
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Order Confirmed Screen */}
        {paymentStep === 'CONFIRMED' && confirmedOrder && (
          <div className="p-8 text-center space-y-6 my-auto max-w-lg mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
                PAYMENT VERIFIED & SUCCESSFUL
              </span>
              <h3 className="text-2xl font-black text-white uppercase">
                ORDER #{confirmedOrder.id} CONFIRMED!
              </h3>
              <p className="text-xs text-zinc-300 mt-2">
                Thank you <strong className="text-white">{confirmedOrder.customerName}</strong>! Your payment has been verified and your order is confirmed with Boran Trends.
              </p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-bold text-blue-400">{confirmedOrder.id}</span>
              </div>
              {confirmedOrder.utrNumber && (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Verified UTR / UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-400">{confirmedOrder.utrNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Payment Method:</span>
                <span className="font-semibold text-zinc-200">{confirmedOrder.paymentMethod} (7013932279)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Delivery Address:</span>
                <span className="font-semibold text-zinc-200 truncate max-w-[200px]">
                  {confirmedOrder.shippingAddress.streetAddress}, {confirmedOrder.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1">
                <span className="text-zinc-300">Total Paid:</span>
                <span className="text-white">₹{confirmedOrder.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
