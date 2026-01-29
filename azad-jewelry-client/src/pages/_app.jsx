import store from "@/redux/store";
import { Provider } from "react-redux";
import ReactModal from "react-modal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import '../styles/index.scss';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LanguageProvider } from "@/context/language-context";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

if (typeof window !== "undefined") {
  ReactModal.setAppElement("body");
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export default function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <LanguageProvider>
          <Elements stripe={stripePromise}>
            <div id="root">
              <Component {...pageProps} />
            </div>
          </Elements>
        </LanguageProvider>
      </Provider>
    </GoogleOAuthProvider>
  )
}
