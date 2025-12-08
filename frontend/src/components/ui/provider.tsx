"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ColorModeProvider defaultTheme="light" enableSystem={false} {...props}>
      <ChakraProvider value={defaultSystem}>
        {props.children}
      </ChakraProvider>
    </ColorModeProvider>
  )
}
