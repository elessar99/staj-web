import * as XLSX from "xlsx";

export const exportToExcel = (data, fileName = "data.xlsx") => {
  // 1. Verileri Excel'e uygun formata dönüştür
  const worksheet = XLSX.utils.json_to_sheet(data);
  const date = new Date();
  // 2. Çalışma kitabı oluştur ve sayfa ekle
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, date.toLocaleDateString('tr-TR'));
  console.log(date.toDateString());
  // 3. Excel dosyasını oluştur ve indir
  XLSX.writeFile(workbook, fileName);
};