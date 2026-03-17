import { Badge } from "@/components/ui/badge";
import { ProductStatus } from "@/interface";

type Props = {
  status: ProductStatus;
};

export function ProductStatusBadge({ status }: Props) {
  switch (status) {
    case ProductStatus.APPROVED:
      return <Badge variant="default">Tasdiqlangan</Badge>;

    case ProductStatus.REJECTED:
      return <Badge variant="destructive">Rad etilgan</Badge>;

    default:
      return <Badge variant="secondary">Nomaʼlum</Badge>;
  }
}
