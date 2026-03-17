import { Download } from "lucide-react";

export const ExportButton = () => {
  const handleExport = async (type: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/export/${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "ADMIN_ACCESS_TOKEN",
            )}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to export ${type}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Failed to export ${type}`);
    }
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => handleExport("buyers")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download size={18} />
        Export haridorlar
      </button>

      <button
        onClick={() => handleExport("sellers")}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download size={18} />
        Export Sotuvchilar
      </button>

      <button
        onClick={() => handleExport("transactions")}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Download size={18} />
        Export Transactions
      </button>

      <button
        onClick={() => handleExport("orders")}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        <Download size={18} />
        Export Buyurtmalar
      </button>

      <button
        onClick={() => handleExport("payments")}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <Download size={18} />
        Export To'lovlar
      </button>
    </div>
  );
};
