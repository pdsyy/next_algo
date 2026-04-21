"use client"
import {createContext} from "react";

export const ThemeContext = createContext({ setDarkTheme: (val: boolean) => {} });