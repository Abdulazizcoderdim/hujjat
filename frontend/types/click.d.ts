export {};

declare global {
  interface Window {
    createPaymentRequest?: (
      payload: {
        service_id: string;
        merchant_id: string;
        amount: string | number;
        transaction_param: string;
        merchant_user_id: string;
        card_type?: "uzcard" | "humo";
      },
      callback: (result: { status: number; [key: string]: any }) => void,
    ) => void;
  }
}
