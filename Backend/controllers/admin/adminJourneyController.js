import AdminJourneyQuery from "../../services/admin/AjourneyQuery.js";
import { addRangeOfSqeunceToDeliveries, checkSequenceConflict } from "../../services/driver/journeyQueries.js";

import HttpStatus from "../../utils/statusCodes.js";
import pool from "../../config/db.js";

const adminJourneyController = {
  fetchAllJourneys: async (req, res) => {
    try {
      const journeys = await AdminJourneyQuery.getAllJourneys();
      res.status(HttpStatus.OK).json({ success: true, data: journeys });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  },

  addJourney: async (req, res) => {
    try {
      const { driver_id, route_id, start_seq, end_seq, journey_date } = req.body;

      // Inline field validations
      const errors = {};
      if (!driver_id) errors.driver_id = "Driver is required";
      if (!route_id) errors.route_id = "Route is required";
      if (!start_seq) errors.start_seq = "Start sequence is required";
      if (!end_seq) errors.end_seq = "End sequence is required";
      if (!journey_date) errors.journey_date = "Journey date is required";

      // Validate sequences are positive numbers
      const startSeqNum = parseInt(start_seq);
      const endSeqNum = parseInt(end_seq);

      if (start_seq && (isNaN(startSeqNum) || startSeqNum <= 0)) {
        errors.start_seq = "Start sequence must be a positive number greater than 0";
      }

      if (end_seq && (isNaN(endSeqNum) || endSeqNum <= 0)) {
        errors.end_seq = "End sequence must be a positive number greater than 0";
      }

      if (startSeqNum && endSeqNum && startSeqNum >= endSeqNum) {
        errors.sequence = "End sequence must be greater than start sequence";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors
        });
      }

      const driverExists = await AdminJourneyQuery.checkDriverExists(driver_id);
      if (!driverExists) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Driver does not exist."
        });
      }

      // UPDATED: Pass journey_date to overlap check
      const overlappingJourneys = await AdminJourneyQuery.checkSequenceOverlap(
        driver_id,
        route_id,
        start_seq,
        end_seq,
        journey_date  // Added journey_date parameter
      );

      if (overlappingJourneys.length > 0) {
        const overlap = overlappingJourneys[0];
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: {
            sequence: `Sequence overlap detected! This driver already has sequences ${overlap.start_seq}-${overlap.end_seq} on this route for this date.`
          }
        });
      }

      const conflictSequences = await checkSequenceConflict(route_id,start_seq,end_seq)
      if(conflictSequences.length>0){
        return res.status(HttpStatus.BAD_REQUEST).json({
          success:false,
          errors:{
            sequence:'some packages chosen in the Sequence has been already taken by another driver'
          }
        })
      }
            const newJourney = await AdminJourneyQuery.addJourney({driver_id,
                route_id,
                start_seq,
                end_seq,
                journey_date
            })

            
            const sequence = await addRangeOfSqeunceToDeliveries(driver_id,route_id,start_seq,end_seq,newJourney.id)
            res.status(HttpStatus.CREATED).json({success:true,data:newJourney})
      } catch (error) {
         res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
      }
    },

  updateJourney: async (req, res) => {
    try {
      const journey_id = req.params.journey_id;
      const { start_seq, end_seq, route_id, driver_id } = req.body;

      // Inline field validations
      const errors = {};
      if (!driver_id) errors.driver_id = "Driver is required";
      if (!route_id) errors.route_id = "Route is required";
      if (!start_seq) errors.start_seq = "Start sequence is required";
      if (!end_seq) errors.end_seq = "End sequence is required";

      // Validate sequences are positive numbers
      const startSeqNum = parseInt(start_seq);
      const endSeqNum = parseInt(end_seq);

      if (start_seq && (isNaN(startSeqNum) || startSeqNum <= 0)) {
        errors.start_seq = "Start sequence must be a positive number greater than 0";
      }

      if (end_seq && (isNaN(endSeqNum) || endSeqNum <= 0)) {
        errors.end_seq = "End sequence must be a positive number greater than 0";
      }

      if (startSeqNum && endSeqNum && startSeqNum >= endSeqNum) {
        errors.sequence = "End sequence must be greater than start sequence";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors
        });
      }

      const driverExists = await AdminJourneyQuery.checkDriverExists(driver_id);
      if (!driverExists) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: { driver_id: "Driver does not exist" }
        });
      }

      // UPDATED: Fetch current journey to get journey_date
      const currentJourneyResult = await pool.query(
        `SELECT TO_CHAR(journey_date, 'YYYY-MM-DD') as journey_date FROM dashboard_data WHERE id = $1`,
        [journey_id]
      );

      if (currentJourneyResult.rows.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          errors: { general: "Journey not found" }
        });
      } 

      const journey_date = currentJourneyResult.rows[0].journey_date;

      // UPDATED: Pass journey_date to overlap check
      const overlappingJourneys = await AdminJourneyQuery.checkSequenceOverlap(
        driver_id,
        route_id,
        start_seq,
        end_seq,
        journey_date,  // Added journey_date parameter
        journey_id     // exclude current journey
      );

      if (overlappingJourneys.length > 0) {
        const overlap = overlappingJourneys[0];
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          errors: {
            sequence: `Sequence overlap detected! This driver already has sequences ${overlap.start_seq}-${overlap.end_seq} on this route for this date.`
          }
        });
      }

      const updatedJourney = await AdminJourneyQuery.updateJourneyById(
        journey_id,
        { start_seq, end_seq, route_id, driver_id }
      );

      res.status(HttpStatus.OK).json({
        success: true,
        data: updatedJourney
      });
    } catch (error) {
      console.error("updateJourney error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Failed to update journey"
      });
    }
  },

  fetchAllDrivers: async (req, res) => {
    try {
      const drivers = await AdminJourneyQuery.getAllDrivers();
      res.status(HttpStatus.OK).json({
        success: true,
        data: drivers
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default adminJourneyController;