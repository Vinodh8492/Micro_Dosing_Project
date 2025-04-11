from flask import Blueprint, request, jsonify # type: ignore
from extensions import db
from models.material import Material, MaterialTransaction, MaterialSchema, MaterialTransactionSchema
from sqlalchemy.exc import IntegrityError # type: ignore

material_bp = Blueprint("materials", __name__)

material_schema = MaterialSchema()
materials_schema = MaterialSchema(many=True)

transaction_schema = MaterialTransactionSchema()
transactions_schema = MaterialTransactionSchema(many=True)

# ➤ Create a new Material
@material_bp.route("/materials", methods=["POST"])
def add_material():
    try:
        data = request.get_json()

        # 🌱 Step 1: Normalize plant_area_location (remove extra spaces, lowercase)
        plant_area_location = data.get("plant_area_location", "").strip().lower()

        location_barcode_id = None
        if plant_area_location:
            existing_material = Material.query.filter_by(plant_area_location=plant_area_location).first()
            if existing_material and existing_material.location_barcode_id:
                location_barcode_id = existing_material.location_barcode_id
            else:
                import uuid
                location_barcode_id = f"LOC-{uuid.uuid4().hex[:8]}"

        # ✅ Step 2: Create material
        new_material = Material(
            title=data.get("title"),
            description=data.get("description"),
            unit_of_measure=data.get("unit_of_measure"),
            current_quantity=data.get("current_quantity"),
            minimum_quantity=data.get("minimum_quantity"),
            maximum_quantity=data.get("maximum_quantity"),
            plant_area_location=plant_area_location,
            location_barcode_id=location_barcode_id,
            barcode_id=data.get("barcode_id"),
            status=data.get("status", "active"),
            supplier=data.get("supplier"),
            supplier_contact_info=data.get("supplier_contact_info"),
            notes=data.get("notes")
        )

        db.session.add(new_material)
        db.session.commit()

        return jsonify({
            "message": "Material added successfully",
            "material": {
                "id": new_material.material_id,
                "title": new_material.title,
                "description": new_material.description,
                "unit_of_measure": new_material.unit_of_measure,
                "current_quantity": new_material.current_quantity,
                "minimum_quantity": new_material.minimum_quantity,
                "maximum_quantity": new_material.maximum_quantity,
                "plant_area_location": new_material.plant_area_location,
                "location_barcode_id": new_material.location_barcode_id,
                "barcode_id": new_material.barcode_id,
                "status": new_material.status,
                "supplier": new_material.supplier,
                "supplier_contact_info": new_material.supplier_contact_info,
                "notes": new_material.notes,
                "created_at": new_material.created_at,
                "updated_at": new_material.updated_at
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ➤ Get all Materials
@material_bp.route("/materials", methods=["GET"])
def get_materials():
    materials = Material.query.all()
    return jsonify(materials_schema.dump(materials)), 200

# ➤ Get a specific Material by ID
@material_bp.route("/materials/<int:material_id>", methods=["GET"])
def get_material(material_id):
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"message": "Material not found"}), 404
    return jsonify(material_schema.dump(material)), 200

# ➤ Update a Material
@material_bp.route("/materials/<int:material_id>", methods=["PUT"])
def update_material(material_id):
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"message": "Material not found"}), 404
    
    data = request.get_json()
    material.title = data.get("title", material.title)
    material.description = data.get("description", material.description)
    material.unit_of_measure = data.get("unit_of_measure", material.unit_of_measure)
    material.current_quantity = data.get("current_quantity", material.current_quantity)
    material.minimum_quantity = data.get("minimum_quantity", material.minimum_quantity)
    material.maximum_quantity = data.get("maximum_quantity", material.maximum_quantity)
    material.plant_area_location = data.get("plant_area_location", material.plant_area_location)
    material.barcode_id = data.get("barcode_id", material.barcode_id)
    material.status = data.get("status", material.status)

    db.session.commit()
    return jsonify(material_schema.dump(material)), 200

# ➤ Delete a Material
@material_bp.route("/materials/<int:material_id>", methods=["DELETE"])
def delete_material(material_id):
    # First, delete all transactions related to this material
    MaterialTransaction.query.filter_by(material_id=material_id).delete()

    # Now, delete the material itself
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    
    db.session.delete(material)
    db.session.commit()
    
    return jsonify({"message": "Material and associated transactions deleted successfully"}), 200

# ➤ Create a Material Transaction
@material_bp.route("/material-transactions", methods=["POST"])
def create_material_transaction():
    data = request.get_json()
    new_transaction = MaterialTransaction(
        material_id=data["material_id"],
        transaction_type=data["transaction_type"],
        quantity=data["quantity"],
        description=data.get("description")
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify(transaction_schema.dump(new_transaction)), 201

# ➤ Get all Material Transactions
@material_bp.route("/material-transactions", methods=["GET"])
def get_material_transactions():
    transactions = MaterialTransaction.query.all()
    return jsonify(transactions_schema.dump(transactions)), 200

# ➤ Get a specific Material Transaction by ID
@material_bp.route("/material-transactions/<int:transaction_id>", methods=["GET"])
def get_material_transaction(transaction_id):
    transaction = MaterialTransaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"message": "Transaction not found"}), 404
    return jsonify(transaction_schema.dump(transaction)), 200
