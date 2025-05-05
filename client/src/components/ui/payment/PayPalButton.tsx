import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
}: PayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/api/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  };

  const onApprove = async (data: any) => {
    console.log("onApprove", data);
    const orderData = await captureOrder(data.orderId);
    console.log("Capture result", orderData);
  };

  const onCancel = async (data: any) => {
    console.log("onCancel", data);
  };

  const onError = async (data: any) => {
    console.log("onError", data);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);
  
  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/api/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout =
            sdkInstance.createPayPalOneTimePaymentSession({
              onApprove,
              onCancel,
              onError,
            });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full">
      <button
        id="paypal-button"
        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
        style={{ height: '40px' }}
      >
        <span className="mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.1057 6.7929C20.4339 8.3553 19.9031 9.4228 19.0381 10.2436C18.1345 11.1003 16.7541 11.6053 15.201 11.6053H14.618C14.3477 11.6053 14.1113 11.8117 14.0738 12.0865L13.5055 15.9201C13.4805 16.0981 13.3345 16.2296 13.1623 16.2296H11.0759C10.8427 16.2296 10.679 15.9981 10.7134 15.7545L12.2759 5.7767C12.3212 5.4664 12.5827 5.2402 12.8842 5.2402H17.9574C18.9641 5.2402 19.753 5.8901 20.1057 6.7929Z" fill="white"/>
            <path d="M9.18354 5.24023C9.48505 5.24023 9.74659 5.46643 9.79185 5.77681L11.3543 15.7545C11.3887 15.9982 11.225 16.2296 10.9918 16.2296H8.90545C8.73321 16.2296 8.58722 16.0982 8.56222 15.9201L7.99394 12.0865C7.95644 11.8118 7.72005 11.6053 7.44972 11.6053L2.21841 11.6053C1.98516 11.6053 1.82141 11.374 1.85579 11.1303L3.41827 1.15262C3.46354 0.842242 3.72508 0.616043 4.02658 0.616043L9.18354 5.24023Z" fill="white"/>
            <path d="M20.1058 6.79297C20.1339 6.95047 20.1495 7.11203 20.1495 7.27957C20.1058 9.69281 18.4714 11.6054 15.201 11.6054H14.618C14.3477 11.6054 14.1114 11.8118 14.0739 12.0866L13.5056 15.9201C13.4806 16.0982 13.3346 16.2297 13.1624 16.2297H11.0759C10.8427 16.2297 10.679 15.9982 10.7134 15.7546L12.2759 5.77683C12.3212 5.46645 12.5827 5.24025 12.8843 5.24025H17.9574C18.9641 5.24025 19.753 5.8902 20.1058 6.79297Z" fill="#003087"/>
          </svg>
        </span>
        <span>Pay with PayPal</span>
      </button>
    </div>
  );
}