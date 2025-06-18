// src/components/Layout/Layout.tsx
import type { FC, ReactNode } from "react";
import styles from "./Layout.module.css";

import { Header } from "@/components/Header/Header";
import { Divider } from "@/components/Divider/Divider";
import { Body } from "@/components/Body/Body";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => (
  <div className={styles.shell}>
    <Header />
    <Divider />
    <Body>{children}</Body>
  </div>
);
