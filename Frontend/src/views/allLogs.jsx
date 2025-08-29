import { useState } from "react";
import '../vCss/allLogs.css';

const AllLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedAction, setSelectedAction] = useState("All");
  return (
    <div className="allLogsContainer">

      </div>
  );
};

export default AllLogs;
