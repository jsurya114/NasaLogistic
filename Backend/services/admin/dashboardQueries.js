import pool from "../../config/db.js";

export const AdminDashboardQueries = {

    updatePaymentTable : async ()=>{
        try {
            console.log('update dashboard table here')
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
     }
}
