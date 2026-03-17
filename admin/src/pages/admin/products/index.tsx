import { ProductStatus } from "@/interface";
import { ProductsListPage } from "./ProductsListPage";

export function ApprovedProductsPage() {
  return (
    <ProductsListPage
      status={ProductStatus.APPROVED}
      title="Tasdiqlangan mahsulotlar"
      description="Platformada faol mahsulotlar ro'yxati"
    />
  );
}

export function RejectedProductsPage() {
  return (
    <ProductsListPage
      status={ProductStatus.REJECTED}
      title="Rad etilgan mahsulotlar"
      description="Moderatsiyadan o'tmagan mahsulotlar ro'yxati"
    />
  );
}
