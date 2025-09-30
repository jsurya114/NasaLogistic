import pool from "../../config/db.js";

export const ExcelFileQueries = {

    createDailyTable: async (tableName) => {
        try {
            await pool.query(`
                CREATE TABLE ${tableName}(
                        id SERIAL PRIMARY KEY,
                        route TEXT,
                        sequence INT,
                        address TEXT,
                        unit TEXT,
                        zipcode INT,
                        tracking_no TEXT,
                        recipient_name TEXT,
                        recipient_phone TEXT,
                        status TEXT,
                        complete_time TIMESTAMP,
                        seq_route_code TEXT,
                        upload_date TIMESTAMP
                )
            `);
            console.log(`✅ Table ${tableName} created successfully`);
        } catch (error) {
            console.error("❌ Error creating table:", error);
        }
    },

    insertDataIntoDailyTable: async (tableName, data,date) => {
        try {
            if (!data || data.length === 0) {
                console.log("⚠️ No data to insert");
                return;
            }

            const values = [];
            const placeholders = [];

            data.forEach((row, i) => {
                const idx = i * 12; // 11 columns now (10 + new seq_route_code)
                placeholders.push(
                    `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5},
                      $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11}, $${idx +12} )`
                );

                // Remove first 4 chars of route
                const routeModified = row.Route ? row.Route.substring(4) : null;

                values.push(
                    row.Route,
                    row.Sequence,
                    row.Address,
                    row.Unit || null,
                    Number(row.ZipCode),
                    row.TrackingNo,
                    row.RecipientName,
                    row.RecipientPhone,
                    row.Status,
                    row.CompleteTime ? new Date(row.CompleteTime) : null,
                    `${row.Sequence}${routeModified}`,
                    new Date(date)
                );
            });

            const query = `
              INSERT INTO ${tableName} (
                route, sequence, address, unit, zipcode,
                tracking_no, recipient_name, recipient_phone,
                status, complete_time, seq_route_code,upload_date
              ) VALUES ${placeholders.join(", ")}
            `;

            await pool.query(query, values);
            console.log(`✅ Successfully inserted ${data.length} rows into ${tableName}`);
        } catch (error) {
            console.error("❌ Error inserting daily data:", error);
        }
    },

    deleteIfTableAlreadyExists: async (tableName) => {
        try {
            await pool.query(`
                DROP TABLE IF EXISTS ${tableName}
            `);
            console.log(`✅ Table ${tableName} deleted`);
        } catch (error) {
            console.error(error);
        }
    },

    mergeDeliveriesAndExcelData:async()=>{
        try {
            await pool.query(`
                        UPDATE deliveries d
SET
    address = e.address,
    address_unit = e.unit,
    zip_code = e.zipcode,
    courier_code = e.tracking_no,
    recp_name = e.recipient_name,
    recipient_phone = e.recipient_phone,
    status = e.status
    
    FROM todays_excel_data e, todays_excel_data u




WHERE d.seq_route_code = e.seq_route_code AND DATE(u.upload_date)= DATE(d.driver_set_date) ;

                `)
                console.log('table merged')
        } catch (error) {
            
        }
    }

};






