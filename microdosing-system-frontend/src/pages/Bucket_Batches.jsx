import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import axios from "axios";
import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom";
import { Tooltip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";


const Bucket_Batches = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const barcodeRefs = useRef({});
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        setMaterials(response.data || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      materials.forEach((material) => {
        const barcodeElement = barcodeRefs.current[material.barcode_id];
        if (material?.barcode_id && barcodeElement) {
          JsBarcode(barcodeElement, material.barcode_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            lineColor: "black",
            background: "transparent",
          });
        }
  
        // ✅ NEW: render location_barcode_id barcode
        const locationBarcodeElement = barcodeRefs.current[`location-${material.location_barcode_id}`];
        if (material?.location_barcode_id && locationBarcodeElement) {
          JsBarcode(locationBarcodeElement, material.location_barcode_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            lineColor: "black",
            background: "transparent",
          });
        }
      });
    }
  }, [materials]);

  const handleEdit = (material_id) => {
    navigate(`/material/${material_id}`);
  };

  const handleDelete = async (material_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:5000/api/materials/${material_id}`);
          setMaterials(materials.filter((m) => m.material_id !== material_id));
          Swal.fire("Deleted!", "The material has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the material.", "error");
        }
      }
    });
  };
  
  const handleView = (materialId) => {
    console.log("View material:", materialId);
    // open modal or redirect to material detail view
  };
  
  

  console.log("materials :", materials)

  // Group materials by location
  const groupedByLocation = materials.reduce((acc, mat) => {
    const location = mat.plant_area_location || "Unknown";
    if (!acc[location]) acc[location] = [];
    acc[location].push(mat);
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6">

      {/* 👇 Add Storage Text Button at the top */}
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Bucket Batches</h1>
      <button
        onClick={() => navigate('/material/create')}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm sm:text-base"
      >
        Add Storage
      </button>
    </div>


      {Object.entries(groupedByLocation).map(([location, materialsList]) => (
        <div key={location} className="mb-12">
          {/* Location + Barcode (Side by side with no large gaps) */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              {location}
            </h2>
            {materialsList[0]?.location_barcode_id && (
              <div className="flex items-center gap-2">
                <svg
                  className="h-12 w-auto"
                  ref={(el) =>
                    (barcodeRefs.current[
                      `location-${materialsList[0].location_barcode_id}`
                    ] = el)
                  }
                ></svg>
                
              </div>
            )}
          </div>
  
          {/* Materials Table */}
          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead className="bg-gray-100 text-xs sm:text-sm font-semibold text-gray-700">
                <tr>
                  <th className="p-3 border-b text-center">Material ID</th>
                  <th className="p-3 border-b text-center">Material Name</th>
                  <th className="p-3 border-b text-center">Location</th>
                  <th className="p-3 border-b text-center">Barcode</th>
                  <th className="p-3 border-b text-center">Description</th>
                  <th className="p-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm text-gray-800">
                {materialsList.map((mat) => (
                  <tr
                    key={mat.material_id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-center">{mat.material_id}</td>
                    <td className="p-3 text-center">{mat.title}</td>
                    <td className="p-3 text-center">{mat.plant_area_location}</td>
                    <td className="p-3 text-center">
                      <svg
                        className="h-10 w-auto mx-auto"
                        ref={(el) => (barcodeRefs.current[mat.barcode_id] = el)}
                      ></svg>
                    </td>
                    <td className="p-3 break-words max-w-xs text-center">
                      {mat.description}
                    </td>
                    <td className="p-3 text-center">
  <Tooltip title="View">
    <IconButton
     onClick={() => navigate(`/material/view/${mat.material_id}`)}
      sx={{
        backgroundColor: "#6a1b9a",
        color: "#fff",
        "&:hover": { backgroundColor: "#4a148c" },
        mr: 1,
      }}
    >
      <VisibilityIcon fontSize="small" />
    </IconButton>
  </Tooltip>

  <Tooltip title="Edit">
    <IconButton
      onClick={() => handleEdit(mat.material_id)}
      sx={{
        backgroundColor: "#1976d2",
        color: "#fff",
        "&:hover": { backgroundColor: "#1565c0" },
        mr: 1,
      }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  </Tooltip>

  <Tooltip title="Delete">
    <IconButton
      onClick={() => handleDelete(mat.material_id)}
      sx={{
        backgroundColor: "#d32f2f",
        color: "#fff",
        "&:hover": { backgroundColor: "#b71c1c" },
      }}
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  </Tooltip>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
  
};

export default Bucket_Batches;
