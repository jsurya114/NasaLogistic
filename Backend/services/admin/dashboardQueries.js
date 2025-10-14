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
     PaymentDashboardTable : async()=>{
        try {
            
            const queryStr = `
            select 
            pd.id, dashboard_data_id, driver_id,d.name as driver_name, journey_date, route_id,
            packages, no_scanned, failed_attempt ,fs ,ds, delivered, closed, payment_date ,driver_payment, paid ,start_seq,
            end_seq, first_stop from payment_dashboard pd
            join drivers d on d.id = pd.driver_id
 
            ;`
            const result = await pool.query(queryStr)
            return result.rows
        } catch (error) {
            console.error(error)
        }
     },

   
}
