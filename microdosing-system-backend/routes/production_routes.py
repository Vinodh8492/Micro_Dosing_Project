from flask import Blueprint, request, jsonify # type: ignore
from extensions import db
from models.production import ProductionOrder, Batch, BatchMaterialDispensing
from flask_jwt_extended import jwt_required, get_jwt_identity # type: ignore
from routes.user_routes import role_required  # Adjust path based on your project structure
from sqlalchemy import cast, Integer
import uuid

production_bp = Blueprint("production", __name__)
@production_bp.route("/production_orders", methods=["POST"])
# @jwt_required(locations=["cookies"])
# @role_required(["admin", "operator"])  # Only allowed roles can create
def create_production_order():
    data = request.get_json()

    required_fields = ["recipe_id", "batch_size", "scheduled_date"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    current_user_id = 1  # TEMP or fetch from auth

    try:
        # 🔢 Generate order number
        last_order = ProductionOrder.query.order_by(
            cast(ProductionOrder.order_number, Integer).desc()
        ).first()

        if last_order and str(last_order.order_number).isdigit():
            next_order_number = str(int(last_order.order_number) + 1)
        else:
            next_order_number = "1"

        # 🔍 Check for existing batch_barcode for the given recipe_id
        existing_order = ProductionOrder.query.filter_by(recipe_id=data["recipe_id"]).first()

        if existing_order and existing_order.batch_barcode:
            batch_barcode = existing_order.batch_barcode
        else:
            batch_barcode = f"BATCH-{uuid.uuid4().hex[:8]}"  # 🔐 Unique batch barcode

        new_order = ProductionOrder(
            order_number=next_order_number,
            recipe_id=data["recipe_id"],
            batch_size=data["batch_size"],
            scheduled_date=data["scheduled_date"],
            status="planned",
            created_by=current_user_id,
            notes=data.get("notes"),
            barcode_id=data.get("barcode_id"),
            batch_barcode=batch_barcode
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            "message": f"Production order created successfully with order_number {next_order_number}!",
            "batch_barcode": batch_barcode
        }), 201

    except Exception as e:
        db.session.rollback()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Duplicate order/barcode"}), 400
        return jsonify({"error": "Failed to create order", "details": str(e)}), 500
@production_bp.route("/production_orders/<int:order_id>", methods=["PUT"])
def update_production_order(order_id):
    data = request.get_json()

    # Debugging Step: Print received data
    print("Received Data for Update:", data)

    if not data:
        return jsonify({"error": "No data received"}), 400

    # Fetch the existing order by ID
    order = ProductionOrder.query.get(order_id)

    if not order:
        return jsonify({"error": "Production order not found"}), 404

    try:
        # Update order fields with new data
        order.order_number = data.get("order_number", order.order_number)
        order.recipe_id = data.get("recipe_id", order.recipe_id)
        order.batch_size = data.get("batch_size", order.batch_size)
        order.scheduled_date = data.get("scheduled_date", order.scheduled_date)
        order.status = data.get("status", order.status)
        order.created_by = data.get("created_by", order.created_by)
        order.notes = data.get("notes", order.notes)

        db.session.commit()
        return jsonify({"message": "Production order updated successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating data:", str(e))
        return jsonify({"error": str(e)}), 500

@production_bp.route("/production_orders/<int:order_id>", methods=["DELETE"])
def delete_production_order(order_id):
    try:
        # Find the production order by ID
        order = ProductionOrder.query.get(order_id)
        
        if not order:
            return jsonify({"error": "Production order not found"}), 404

        # Delete the order
        db.session.delete(order)
        db.session.commit()

        return jsonify({"message": f"Production order {order_id} deleted successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error deleting data:", str(e))
        return jsonify({"error": str(e)}), 500

@production_bp.route("/production_orders/<int:order_id>", methods=["GET"])
def get_production_order(order_id):
    order = ProductionOrder.query.get(order_id)
    if not order:
        return jsonify({"error": "Production order not found"}), 404

    order_data = {
        "order_id": order.order_id,
        "order_number": order.order_number,
        "recipe_id": order.recipe_id,
        "batch_size": order.batch_size,
        "scheduled_date": order.scheduled_date.isoformat() if order.scheduled_date else None,
        "status": order.status,
        "created_by": order.created_by,
        "notes": order.notes,
        "batch_barcode": order.batch_barcode
    }
    return jsonify(order_data), 200

@production_bp.route("/production_orders", methods=["GET"])
def get_production_orders():
    orders = ProductionOrder.query.all()
    result = [
        {
            "order_id": order.order_id,
            "order_number": order.order_number,
            "recipe_id": order.recipe_id,
            "batch_size": str(order.batch_size),
            "scheduled_date": order.scheduled_date.strftime("%Y-%m-%d"),
            "status": order.status,
            "created_by": order.created_by,
            "batch_barcode": order.batch_barcode
        }
        for order in orders
    ]
    return jsonify(result)

@production_bp.route("/production-orders/<int:order_id>/reject", methods=["PUT"])
@jwt_required()
@role_required(["admin"])  # ✅ Only admin can reject
def reject_production_order(order_id):
    order = ProductionOrder.query.get(order_id)

    if not order:
        return jsonify({"error": "Production order not found"}), 404

    order.status = "rejected"
    db.session.commit()

    return jsonify({"message": "Production order rejected successfully"}), 200

### 🚀 BATCH ROUTES ###
@production_bp.route("/batches", methods=["POST"])
def create_batch():
    data = request.get_json()
    new_batch = Batch(
        batch_number=data["batch_number"],
        order_id=data["order_id"],
        status=data.get("status", "pending"),
        operator_id=data["operator_id"],
        notes=data.get("notes"),
    )
    db.session.add(new_batch)
    db.session.commit()
    return jsonify({"message": "Batch created successfully!"}), 201

@production_bp.route("/batches", methods=["GET"])
def get_batches():
    batches = Batch.query.all()
    result = [
        {
            "batch_id": batch.batch_id,
            "batch_number": batch.batch_number,
            "order_id": batch.order_id,
            "status": batch.status,
            "operator_id": batch.operator_id,
            "notes": batch.notes,
        }
        for batch in batches
    ]
    return jsonify(result)

### 🚀 BATCH MATERIAL DISPENSING ROUTES ###
@production_bp.route("/batch_dispensing", methods=["POST"])
def create_batch_dispensing():
    data = request.get_json()
    new_dispensing = BatchMaterialDispensing(
        batch_id=data["batch_id"],
        material_id=data["material_id"],
        planned_quantity=data["planned_quantity"],
        actual_quantity=data.get("actual_quantity"),
        dispensed_by=data["dispensed_by"],
        status=data.get("status", "pending"),
    )
    db.session.add(new_dispensing)
    db.session.commit()
    return jsonify({"message": "Material dispensing record created successfully!"}), 201

@production_bp.route("/batch_dispensing", methods=["GET"])
def get_batch_dispensing():
    dispensing_records = BatchMaterialDispensing.query.all()
    result = [
        {
            "dispensing_id": record.dispensing_id,
            "batch_id": record.batch_id,
            "material_id": record.material_id,
            "planned_quantity": str(record.planned_quantity),
            "actual_quantity": str(record.actual_quantity) if record.actual_quantity else None,
            "dispensed_by": record.dispensed_by,
            "status": record.status,
        }
        for record in dispensing_records
    ]
    return jsonify(result)
