import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>NovaBank Digital</title>
        <meta
          name="description"
          content="UI banking untuk login, transfer, cek saldo, dan aktivitas."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
