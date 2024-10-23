const PrivacyPolicy = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen  bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-6">
  <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

  {/* Section 1: How we use your information */}
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-2">How we use your information?</h2>
    <p className="text-left">
      We take your email id only for the authentication of your account and do not collect any other information. 
      The media that you generate using our tool will only be stored in the database for your use in the future. 
      We do not sell any of your data to any third-party services.
    </p>
  </section>

  {/* Section 2: Payment */}
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Payment</h2>
    <p className="text-left">
      We use Razorpay for processing payments. Neither we nor Razorpay store your card data on their servers. 
      The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. 
      Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, 
      your purchase transaction information is not saved. Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, 
      which is a joint effort of brands like Visa, MasterCard, American Express, and Discover. 
      PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.
    </p>
  </section>

  {/* Section 3: Cookies */}
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Cookies</h2>
    <p className="text-left">
      We use cookies to maintain the session of your user. It is not used to personally identify you on other websites.
    </p>
  </section>

  {/* Section 4: Contact */}
  <section>
    <h2 className="text-xl font-semibold mb-2">Contact</h2>
    <p className="text-left">
      If you have any questions about this Privacy Policy, please contact us at: 
      <a href="mailto:ianassagar@gmail.com" className="text-blue-500 hover:underline"> ianassagar@gmail.com</a>.
    </p>
  </section>
</div>

      </div>
    );
  };
  
  export default PrivacyPolicy;
  