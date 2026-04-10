import type { Metadata } from "next";
import AddBrandForm from "./AddBrandForm";

export const metadata: Metadata = { title: "Add a Brand" };

export default function AddBrandPage() {
  return <AddBrandForm />;
}
