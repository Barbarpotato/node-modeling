import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import Navigation from "@/components/navigation";
import { GlobalContextProvider } from "@/context/GlobalContext";

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <GlobalContextProvider>
        <Navigation />
        <Component {...pageProps} />
      </GlobalContextProvider>
    </ChakraProvider>
  )
}
