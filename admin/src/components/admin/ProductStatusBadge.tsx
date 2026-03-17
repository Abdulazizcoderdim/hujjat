import { Badge } from "@/components/ui/badge";
import { ProductStatus } from "@/interface";

type Props = {
  status: ProductStatus;
};

export function ProductStatusBadge({ status }: Props) {
  switch (status) {
    case ProductStatus.PENDING:
      return <Badge variant="secondary">Kutilmoqda</Badge>;

    case ProductStatus.APPROVED:
      return <Badge variant="default">Tasdiqlangan</Badge>;

    case ProductStatus.REJECTED:
      return <Badge variant="destructive">Rad etilgan</Badge>;

    case ProductStatus.DISABLED:
      return <Badge variant="secondary">Faol emas</Badge>;

    case ProductStatus.REGENERATE:
      return <Badge variant="secondary">Qayta generatsiya</Badge>;

    case ProductStatus.PREVIEW:
      return <Badge variant="secondary">Qayta preview</Badge>;

    default:
      return <Badge variant="secondary">Nomaʼlum</Badge>;
  }
}
