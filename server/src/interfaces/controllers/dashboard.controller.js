import DashboardService from "../../application/services/dashboard.service.js";

const getMetrics = async (req, res) => {
  try {
    const metrics = await DashboardService.getMetrics(req.user.id);
    res.json({ data: metrics });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { getMetrics };
