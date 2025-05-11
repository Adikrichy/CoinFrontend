// exportData.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Экспорт в CSV
export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Заголовки
        ...data.map(row => headers.map(header => row[header]).join(',')) // Данные
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
};

// Экспорт в PDF
export const exportToPDF = (data, filename) => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();

    // Заголовок
    doc.setFontSize(16);
    doc.text('Financial Report', 14, 15);

    // Дата создания
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Таблица
    autoTable(doc, {
        head: [Object.keys(data[0])],
        body: data.map(row => Object.values(row)),
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Сохраняем
    doc.save(`${filename}.pdf`);
};

// Подготовка транзакций
export const prepareTransactionData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
        return [];
    }

    return transactions.map(transaction => {
        if (!transaction) return null;

        return {
            'Date': transaction.date ? new Date(transaction.date).toLocaleDateString() : '-',
            'Type': transaction.transactionType?.transactionTypeName || '-',
            'Category': transaction.category?.categoryName || '-',
            'Amount': transaction.amount ? `Kzt. ${transaction.amount}` : 'Kzt. 0',
            'Description': transaction.description || '-'
        };
    }).filter(item => item !== null);
};

// Подготовка категорий
export const prepareCategoryData = (categories) => {
    if (!categories || !Array.isArray(categories)) {
        return [];
    }

    return categories.map(category => ({
        'Category': category.categoryName,
        'Type': category.transactionType?.transactionTypeName || '-',
        'Total Amount': `Kzt. ${category.amount || 0}`
    }));
};
