import { ProductStatus } from "@/interface";
import { ProductsListPage } from "./ProductsListPage";

export function PendingProductsPage() {
  return (
    <ProductsListPage
      status={ProductStatus.PENDING}
      title="Kutilayotgan mahsulotlar"
      description="Moderatsiya kutayotgan mahsulotlar ro'yxati"
    />
  );
}

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

export function RegenerateProductsPage() {
  return (
    <ProductsListPage
      status={ProductStatus.REGENERATE}
      title="Qayta generatsiya qilingan mahsulotlar"
      description="Qayta generatsiya qilingan mahsulotlar ro'yxati"
    />
  );
}
export function PreviewProductsPage() {
  return (
    <ProductsListPage
      status={ProductStatus.PREVIEW}
      title="Qayta preview qilingan mahsulotlar"
      description="Qayta preview qilingan mahsulotlar ro'yxati"
    />
  );
}
