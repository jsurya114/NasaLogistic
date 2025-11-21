import pool from "../../config/db.js";

export const AdminDashboardQueries = {
  updatePaymentTable: async () => {
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
      `;
      await pool.query(queryStr);
    } catch (error) {
      console.error("Error in updatePaymentTable:", error);
      throw error;
    }
  },

  PaymentDashboardTable: async (filters = {}) => {
    try {
      console.log("PaymentDashboardTable called with filters:", filters);

      // Base query - city_id is in drivers table, not routes table
      const baseQuery = `
        SELECT 
          pd.id, 
          pd.dashboard_data_id, 
          pd.driver_id,
          d.name as driver_name, 
          pd.journey_date, 
          pd.route_id,
          r.name as route_name,
          c.job,
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
        LEFT JOIN city c ON d.city_id = c.id
        LEFT JOIN routes r ON pd.route_id = r.id
        WHERE 1=1
      `;

      const whereClauses = [];
      const queryParams = [];

      // Apply filters - build WHERE clauses dynamically
      if (filters.job) {
        whereClauses.push(`c.job = $${queryParams.length + 1}`);
        queryParams.push(filters.job);
      }

      if (filters.driver) {
        whereClauses.push(`d.name = $${queryParams.length + 1}`);
        queryParams.push(filters.driver);
      }

      if (filters.route) {
        whereClauses.push(`r.name = $${queryParams.length + 1}`);
        queryParams.push(filters.route);
      }

      if (filters.startDate) {
        whereClauses.push(`pd.journey_date >= $${queryParams.length + 1}::date`);
        queryParams.push(filters.startDate);
      }

      if (filters.endDate) {
        whereClauses.push(`pd.journey_date <= $${queryParams.length + 1}::date`);
        queryParams.push(filters.endDate);
      }

      if (filters.paymentStatus) {
        const isPaid = filters.paymentStatus.toLowerCase() === "paid";
        whereClauses.push(`pd.paid = $${queryParams.length + 1}`);
        queryParams.push(isPaid);
      }

      // Build final query
      let finalQuery = baseQuery;
      if (whereClauses.length > 0) {
        finalQuery += ' AND ' + whereClauses.join(' AND ');
      }
      finalQuery += ' ORDER BY pd.journey_date DESC;';

      console.log("Executing query:", finalQuery);
      console.log("With params:", queryParams);

      const result = await pool.query(finalQuery, queryParams);
      console.log("Query returned", result.rows.length, "rows");
      
      return result.rows;
    } catch (error) {
      console.error("Error in PaymentDashboardTable:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  },
};