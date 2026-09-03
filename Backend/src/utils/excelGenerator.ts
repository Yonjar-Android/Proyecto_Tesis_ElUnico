import ExcelJS from 'exceljs';

export type ReportType = 'productos_stock' | 'clientes_deuda' | 'ventas_por_periodo' | 'compras_por_periodo';

export const generateExcelReport = async (
    reportData: any,
    reportType: ReportType
): Promise<ExcelJS.Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Reportes';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Reporte');

    // Configurar columnas según el tipo de reporte
    let numColumnas = 0; // Variable para saber cuántas columnas tiene la tabla
    
    if (reportType === 'productos_stock') {
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10, style: { numFmt: '0' } },
            { header: 'Producto', key: 'Nombre', width: 30 },
            { header: 'Marca', key: 'Nombre_marca', width: 20 },
            { header: 'Categoría', key: 'Nombre_categoria', width: 20 },
            { header: 'Precio Venta', key: 'Precio_venta', width: 15, style: { numFmt: '#,##0.00' } },
            { header: 'Stock', key: 'Stock', width: 10, style: { numFmt: '0' } },
            { header: 'Stock Mínimo', key: 'Stock_min', width: 15, style: { numFmt: '0' } },
            { header: 'Fecha Vencimiento', key: 'Fecha_vencimiento', width: 20, style: { numFmt: 'DD/MM/YYYY' } }
        ];
        numColumnas = 8;
    } else if (reportType === 'clientes_deuda') {
        worksheet.columns = [
            { header: 'N° Cliente', key: 'NCliente', width: 15, style: { numFmt: '@' } },
            { header: 'Nombre', key: 'Nombre', width: 25 },
            { header: 'Apellido', key: 'Apellido', width: 25 },
            { header: 'Email', key: 'Email', width: 30 },
            { header: 'Teléfono', key: 'Telefono', width: 15, style: { numFmt: '@' } },
            { header: 'Saldo Deuda', key: 'Saldo_Deuda', width: 15, style: { numFmt: '#,##0.00' } }
        ];
        numColumnas = 6;
    } else if (reportType === 'ventas_por_periodo') {
        worksheet.columns = [
            { header: 'ID Venta', key: 'id', width: 10, style: { numFmt: '0' } },
            { header: 'Fecha', key: 'Fecha', width: 15, style: { numFmt: 'DD/MM/YYYY' } },
            { header: 'Cliente', key: 'Cliente', width: 30 },
            { header: 'N° Cliente', key: 'NCliente', width: 15, style: { numFmt: '@' } },
            { header: 'Tipo Pago', key: 'Tipo_Pago', width: 15 },
            { header: 'Total Original', key: 'TotalOriginal', width: 15, style: { numFmt: '#,##0.00' } },
            { header: 'Total Devuelto', key: 'TotalDevuelto', width: 15, style: { numFmt: '#,##0.00' } },
            { header: 'Total Neto', key: 'Total', width: 15, style: { numFmt: '#,##0.00' } }
        ];
        numColumnas = 8;
    } else if (reportType === 'compras_por_periodo') {
        worksheet.columns = [
            { header: 'ID Compra', key: 'id', width: 10, style: { numFmt: '0' } },
            { header: 'Fecha', key: 'Fecha', width: 15, style: { numFmt: 'DD/MM/YYYY' } },
            { header: 'N° Factura', key: 'NFactura', width: 20, style: { numFmt: '@' } },
            { header: 'Total', key: 'Total', width: 15, style: { numFmt: '#,##0.00' } },
            { header: 'ID Proveedor', key: 'Id_proveedor', width: 12, style: { numFmt: '0' } },
            { header: 'Empresa', key: 'Nombre_Empresa', width: 30 },
            { header: 'Contacto', key: 'Nombre_Contacto', width: 25 }
        ];
        numColumnas = 7;
    }

    // Estilizar el header
    worksheet.getRow(1).font = { 
        bold: true, 
        color: { argb: 'FFFFFF' },
        size: 12
    };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
    };
    worksheet.getRow(1).alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
    };
    worksheet.getRow(1).height = 25;

    // Agregar datos
    if (reportData.data && Array.isArray(reportData.data)) {
        reportData.data.forEach((row: any) => {
            // Crear una copia del row para modificar los valores
            const excelRow: any = {};
            
            // Asignar valores según el tipo de reporte
            if (reportType === 'productos_stock') {
                excelRow.id = Number(row.id);
                excelRow.Nombre = row.Nombre;
                excelRow.Nombre_marca = row.Nombre_marca;
                excelRow.Nombre_categoria = row.Nombre_categoria;
                excelRow.Precio_venta = Number(row.Precio_venta);
                excelRow.Stock = Number(row.Stock);
                excelRow.Stock_min = Number(row.Stock_min);
                excelRow.Fecha_vencimiento = row.Fecha_vencimiento ? new Date(row.Fecha_vencimiento) : null;
            } else if (reportType === 'clientes_deuda') {
                excelRow.NCliente = row.NCliente ? String(row.NCliente) : '';
                excelRow.Nombre = row.Nombre;
                excelRow.Apellido = row.Apellido;
                excelRow.Email = row.Email;
                excelRow.Telefono = row.Telefono ? String(row.Telefono) : '';
                excelRow.Saldo_Deuda = Number(row.Saldo_Deuda);
            } else if (reportType === 'ventas_por_periodo') {
                excelRow.id = Number(row.id);
                excelRow.Fecha = row.Fecha ? new Date(row.Fecha) : null;
                excelRow.Cliente = row.Cliente;
                excelRow.NCliente = row.NCliente ? String(row.NCliente) : '';
                excelRow.Tipo_Pago = row.Tipo_Pago;
                excelRow.TotalOriginal = Number(row.TotalOriginal);
                excelRow.TotalDevuelto = Number(row.TotalDevuelto);
                excelRow.Total = Number(row.Total);
            } else if (reportType === 'compras_por_periodo') {
                excelRow.id = Number(row.id);
                excelRow.Fecha = row.Fecha ? new Date(row.Fecha) : null;
                excelRow.NFactura = row.NFactura ? String(row.NFactura) : '';
                excelRow.Total = Number(row.Total);
                excelRow.Id_proveedor = Number(row.Id_proveedor);
                excelRow.Nombre_Empresa = row.Nombre_Empresa;
                excelRow.Nombre_Contacto = row.Nombre_Contacto;
            }
            
            worksheet.addRow(excelRow);
        });
    }

    // === ESTADÍSTICAS EN COLUMNAS SEPARADAS A LA DERECHA ===
    const colInicioStats = numColumnas + 2; // Dejar una columna de espacio

    worksheet.getColumn(colInicioStats).width = 25; // Para el label
    worksheet.getColumn(colInicioStats + 1).width = 20; // Para el valor
    
    // Título de estadísticas
    const tituloStats = worksheet.getRow(1);
    tituloStats.getCell(colInicioStats).value = 'ESTADÍSTICAS';
    tituloStats.getCell(colInicioStats).font = { 
        bold: true, 
        color: { argb: 'FFFFFF' },
        size: 12
    };
    tituloStats.getCell(colInicioStats).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
    };
    tituloStats.getCell(colInicioStats).alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
    };
    tituloStats.getCell(colInicioStats).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    
    // Agregar estadísticas en filas 2, 3, 4, etc.
    let filaActual = 2;
    
    if (reportType === 'productos_stock') {
        const stats = [
            { label: 'Total Evaluados:', value: reportData.TotalProductosEvaluados, format: '0' },
            { label: 'Total en Riesgo:', value: reportData.TotalProductosEnRiesgo, format: '0' }
        ];
        
        stats.forEach(stat => {
            const row = worksheet.getRow(filaActual);
            row.getCell(colInicioStats).value = stat.label;
            row.getCell(colInicioStats).font = { bold: true };
            row.getCell(colInicioStats).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
            row.getCell(colInicioStats).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            row.getCell(colInicioStats + 1).value = Number(stat.value);
            row.getCell(colInicioStats + 1).numFmt = stat.format;
            row.getCell(colInicioStats + 1).font = { bold: true };
            row.getCell(colInicioStats + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            row.getCell(colInicioStats + 1).alignment = { horizontal: 'right' };
            row.getCell(colInicioStats + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            filaActual++;
        });
    } else if (reportType === 'clientes_deuda') {
        const stats = [
            { label: 'Total Clientes:', value: reportData.TotalClientesConDeuda, format: '0' },
            { label: 'Saldo Pendiente:', value: reportData.TotalSaldoPendiente, format: '#,##0.00' }
        ];
        
        stats.forEach(stat => {
            const row = worksheet.getRow(filaActual);
            row.getCell(colInicioStats).value = stat.label;
            row.getCell(colInicioStats).font = { bold: true };
            row.getCell(colInicioStats).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
            row.getCell(colInicioStats).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            row.getCell(colInicioStats + 1).value = Number(stat.value);
            row.getCell(colInicioStats + 1).numFmt = stat.format;
            row.getCell(colInicioStats + 1).font = { bold: true };
            row.getCell(colInicioStats + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            row.getCell(colInicioStats + 1).alignment = { horizontal: 'right' };
            row.getCell(colInicioStats + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            filaActual++;
        });
    } else if (reportType === 'ventas_por_periodo') {
        const stats = [
            { label: 'Total Registros:', value: reportData.TotalRegistros, format: '0' },
            { label: 'Ventas Contado:', value: reportData.VentasContado, format: '#,##0.00' },
            { label: 'Total Ventas:', value: reportData.TotalVentas, format: '#,##0.00' }
        ];
        
        stats.forEach(stat => {
            const row = worksheet.getRow(filaActual);
            row.getCell(colInicioStats).value = stat.label;
            row.getCell(colInicioStats).font = { bold: true };
            row.getCell(colInicioStats).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
            row.getCell(colInicioStats).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            row.getCell(colInicioStats + 1).value = Number(stat.value);
            row.getCell(colInicioStats + 1).numFmt = stat.format;
            row.getCell(colInicioStats + 1).font = { bold: true };
            row.getCell(colInicioStats + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            row.getCell(colInicioStats + 1).alignment = { horizontal: 'right' };
            row.getCell(colInicioStats + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            filaActual++;
        });
    } else if (reportType === 'compras_por_periodo') {
        const stats = [
            { label: 'Total Registros:', value: reportData.TotalRegistros, format: '0' },
            { label: 'Total Compras:', value: reportData.TotalCompras, format: '#,##0.00' }
        ];
        
        stats.forEach(stat => {
            const row = worksheet.getRow(filaActual);
            row.getCell(colInicioStats).value = stat.label;
            row.getCell(colInicioStats).font = { bold: true };
            row.getCell(colInicioStats).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
            row.getCell(colInicioStats).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            row.getCell(colInicioStats + 1).value = Number(stat.value);
            row.getCell(colInicioStats + 1).numFmt = stat.format;
            row.getCell(colInicioStats + 1).font = { bold: true };
            row.getCell(colInicioStats + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
            row.getCell(colInicioStats + 1).alignment = { horizontal: 'right' };
            row.getCell(colInicioStats + 1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            filaActual++;
        });
    }

    // Formatear celdas específicas según la columna
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        
        // Solo formatear las celdas de la tabla principal (no las estadísticas)
        if (reportType === 'productos_stock') {
            if (rowNumber <= reportData.data.length + 1) {
                row.getCell(1).numFmt = '0'; // ID
                row.getCell(5).numFmt = '#,##0.00'; // Precio Venta
                row.getCell(6).numFmt = '0'; // Stock
                row.getCell(7).numFmt = '0'; // Stock Mínimo
                if (row.getCell(8).value instanceof Date) {
                    row.getCell(8).numFmt = 'DD/MM/YYYY';
                }
            }
        } else if (reportType === 'clientes_deuda') {
            if (rowNumber <= reportData.data.length + 1) {
                row.getCell(1).numFmt = '@'; // N° Cliente
                row.getCell(5).numFmt = '@'; // Teléfono
                row.getCell(6).numFmt = '#,##0.00'; // Saldo Deuda
            }
        } else if (reportType === 'ventas_por_periodo') {
            if (rowNumber <= reportData.data.length + 1) {
                row.getCell(1).numFmt = '0'; // ID Venta
                if (row.getCell(2).value instanceof Date) {
                    row.getCell(2).numFmt = 'DD/MM/YYYY'; // Fecha
                }
                row.getCell(4).numFmt = '@'; // N° Cliente
                row.getCell(6).numFmt = '#,##0.00'; // Total Original
                row.getCell(7).numFmt = '#,##0.00'; // Total Devuelto
                row.getCell(8).numFmt = '#,##0.00'; // Total Neto
            }
        } else if (reportType === 'compras_por_periodo') {
            if (rowNumber <= reportData.data.length + 1) {
                row.getCell(1).numFmt = '0'; // ID Compra
                if (row.getCell(2).value instanceof Date) {
                    row.getCell(2).numFmt = 'DD/MM/YYYY'; // Fecha
                }
                row.getCell(3).numFmt = '@'; // N° Factura
                row.getCell(4).numFmt = '#,##0.00'; // Total
                row.getCell(5).numFmt = '0'; // ID Proveedor
            }
        }
        
        // Alinear números a la derecha (solo en la tabla principal)
        if (rowNumber <= reportData.data.length + 1) {
            row.eachCell((cell: any) => {
                if (typeof cell.value === 'number' && cell.numFmt !== '@') {
                    cell.alignment = { horizontal: 'right' };
                }
            });
        }
    });

    // Agregar bordes a la tabla principal
    worksheet.eachRow((row, rowNumber) => {
        const lastDataRow = reportData.data ? reportData.data.length + 1 : 1;
        if (rowNumber <= lastDataRow) {
            // Solo aplicar bordes a las columnas de la tabla principal
            for (let col = 1; col <= numColumnas; col++) {
                const cell = row.getCell(col);
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};