import pool from "../../config/db.js";

        export const WeeklyExcelQueries={
            fetchDashboardDataByDates : async(dates)=>{
                const query=`SELECT 
            dd.id AS dashboard_id,
            dd.journey_date,
            d.name,
            r.name AS route_name, 
            dd.start_seq,
            dd.end_seq,
            dd.packages,
            dd.delivered,
            dd.ds,
            dd.no_scanned,
            dd.failed_attempt
        FROM dashboard_data dd
        JOIN drivers d ON dd.driver_id = d.id
        JOIN routes r ON dd.route_id = r.id
        WHERE journey_date in $1`
            
        const value=[dates];

        const res= await pool.query(query,value);
        return res.rows;
            },

        createWeeklyTable:async(table_name)=>{
        try {
            await pool.query(`
                        CREATE TABLE ${table_name}(
                                id SERIAL PRIMARY KEY,
                                orig_name varchar(25),
                                match_name varchar(25),
                                date DATE,
                                deliveries INT,
                                fullStop INT,
                                doubleStop INT,
                                route TEXT,
                                start_seq INT,
                                end_seq INT,
                                ambiguous boolean,
                                upload_date TIMESTAMP DEFAULT NOW()
                        );
                    `);
            console.log(`✅ Table ${table_name} created successfully`);
            } catch (error) {
            console.error("❌ Error creating table:", error);
            }
        },

        deleteWeeklyTableIfExists: async (table_name) => {
        try {
      await pool.query(`
                DROP TABLE IF EXISTS ${table_name}
            `);
      console.log(`✅ Table ${table_name} deleted`);
    } catch (error) {
      console.error(error);
    }
  },

}