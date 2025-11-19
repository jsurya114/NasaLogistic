import pool from "../../config/db.js";

export const AdminDashboardQueries = {

    updatePaymentTable : async ()=>{
        try {

            const queryStr = `
            UPDATE payment_dashboard pd
SET 
    no_scanned = dd.no_scanned,
    failed_attempt = dd.failed_attempt,
    ds = dd.ds,
    fs = dd.first_stop,
    delivered = dd.ds + dd.first_stop,
    driver_payment = (dd.ds * r.driver_doublestop_price) + (dd.first_stop * r.company_route_price)
FROM dashboard_data dd
JOIN routes r ON dd.route_id = r.id
WHERE pd.dashboard_data_id = dd.id;


            `
            await pool.query(queryStr)
            
        } catch (error) {
            console.error(error)
            
        }
    },
     PaymentDashboardTable : async () => {
  try {
    const queryStr = `
      SELECT 
        pd.id, 
        pd.dashboard_data_id, 
        pd.driver_id,
        d.name AS driver_name, 
        pd.journey_date, 
        pd.route_id,
        r.name AS route_name,               -- 🌟 ADD THIS
        pd.packages, 
        pd.no_scanned, 
        pd.failed_attempt,
        pd.fs,
        pd.ds,
        pd.delivered, 
        pd.closed, 
        pd.payment_date,
        pd.driver_payment, 
        pd.paid,
        pd.start_seq,
        pd.end_seq,
        pd.first_stop
      FROM payment_dashboard pd
      JOIN drivers d ON d.id = pd.driver_id
      LEFT JOIN routes r ON r.id = pd.route_id;  
    `;
    
    const result = await pool.query(queryStr);
    return result.rows;

  } catch (error) {
    console.error(error);
  }
},

   
}
