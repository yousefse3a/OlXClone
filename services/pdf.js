const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  // generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
  doc
    .image("download.png", 50, 45, { width: 50 })
    // .fillColor("red")
    // .fontSize(20)
    // .text("OLX", 110, 57)
    .fontSize(10)
    .fillColor("black")
    .text("OLX", 200, 50, { align: "right" })
    .moveDown();
}

// function generateCustomerInformation(doc, invoice) {
//   doc
//     .fillColor("#444444")
//     .fontSize(20)
//     .text("product owner", 50, 160);

//   generateHr(doc, 185);

//   const customerInformationTop = 200;

//   doc
//     .fontSize(10)
//     .text("frist name:", 50, customerInformationTop)
//     .font("Helvetica-Bold")
//     .text(invoice.invoice_nr, 150, customerInformationTop)
//     .font("Helvetica")
//     .text("created at:", 50, customerInformationTop + 15)
//     .text(formatDate(new Date()), 150, customerInformationTop + 15)
//     .text("email:", 50, customerInformationTop + 30)
//     .text(
//       formatCurrency(invoice.subtotal - invoice.paid),
//       150,
//       customerInformationTop + 30
//     )

//     // .font("Helvetica-Bold")
//     // .text(invoice.shipping.name, 300, customerInformationTop)
//     // .font("Helvetica")
//     // .text(invoice.shipping.address, 300, customerInformationTop + 15)
//     // .text(
//     //   invoice.shipping.city +
//     //     ", " +
//     //     invoice.shipping.state +
//     //     ", " +
//     //     invoice.shipping.country,
//     //   300,
//     //   customerInformationTop + 30
//     // )
//     // .moveDown();

//   generateHr(doc, 252);
// }

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 100;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "ID",
    "title",
    "descrpation",
    "price"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.products.length; i++) {
    const item = invoice.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item._id,
      item.title,
      item.desc,
      item.price
    );

    generateHr(doc, position + 20);
  }

  // const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  // generateTableRow(
  //   doc,
  //   subtotalPosition,
  //   "",
  //   "",
  //   "userNumber",
  //   "",
  //   formatCurrency(invoice.userNumber)
  // );

  // const paidToDatePosition = subtotalPosition + 20;
  // generateTableRow(
  //   doc,
  //   paidToDatePosition,
  //   "",
  //   "",
  //   "Paid To Date",
  //   "",
  //   formatCurrency(invoice.paid)
  // );

  // const duePosition = paidToDatePosition + 25;
  // doc.font("Helvetica-Bold");
  // generateTableRow(
  //   doc,
  //   duePosition,
  //   "",
  //   "",
  //   "Balance Due",
  //   "",
  //   formatCurrency(invoice.subtotal - invoice.paid)
  // );
  // doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "This product has been created. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  _id,
  title,
  desc,
  price,

) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(_id, 200, y)
    .text(title, 280, y, { width: 90, align: "right" })
    .text(desc, 370, y, { width: 90, align: "right" })
    .text(price, 0, y, { width: 100,align: "right" })

}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice
};