import e from "express";
import {
  insertJourney,
  getTodayJourney,
  addRangeOfSqeunceToDeliveries,
  checkSequenceConflict,
  // updateSeqRouteCodeToDeliveriesTable
} from "../../services/driver/journeyQueries.js";
import HttpStatus from "../../utils/statusCodes.js";

export const saveJourney = async (req, res) => {
  try {
    let { driver_id, route_id, packages, start_seq, end_seq, journey_date } = req.body;

    start_seq = Number(start_seq);
    end_seq = Number(end_seq);
    packages = end_seq - start_seq + 1; // 

    const errors = {};
    if (!driver_id) errors.driver_id = "Driver ID is required";
    if (!route_id) errors.route_id = "Route is required";
    if (!start_seq || start_seq <= 0) errors.start_seq = "Start sequence must be greater than 0";
    if (!end_seq || end_seq < start_seq) errors.end_seq = "End sequence must be >= start sequence";

    const conflictSequences = await checkSequenceConflict(route_id, start_seq, end_seq,journey_date);

    if (conflictSequences.length > 0) {
      errors.sequenceConflict =
        "Some packages in this sequence range are already taken by another driver";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check if this driver already saved journey today
    const existingJourney = await getTodayJourney(driver_id);

    if (existingJourney.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Journey for today is already saved",
      });
    }

    // Insert journey
    const journey = await insertJourney({
      driver_id,
      route_id,
      packages,
      start_seq,
      end_seq,
      journey_date: journey_date || new Date().toISOString().split("T")[0],
    });

    if (journey.success === false) {
      return res.status(500).json({
        success: false,
        message: journey.message,
        error: journey.error,
      });
    }

    const sequence = await addRangeOfSqeunceToDeliveries(
      driver_id,
      route_id,
      start_seq,
      end_seq,
      journey.id
    );

    if (sequence.success === false) {
      return res.status(500).json({
        success: false,
        message: "Journey saved but failed to add delivery sequences",
        error: sequence.error,
      });
    }

    return res.status(201).json({ success: true, data: journey });
  } catch (error) {
    console.error("saveJourney error:", error);
    return res.status(500).json({
      success: false,
      message: "Error inserting journey",
      error: error.message,
    });
  }
};


export const fetchTodayJourney = async (req, res) => {
  try {
    const driverId = req.params.driver_id;
    const journey = await getTodayJourney(driverId);
    res.status(HttpStatus.OK).json({ success: true, data: journey });
  } catch (error) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Error fetching journey" });
  }
};