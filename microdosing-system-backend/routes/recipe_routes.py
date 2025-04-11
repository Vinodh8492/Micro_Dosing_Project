from flask import Blueprint, request, jsonify # type: ignore
from extensions import db
from models.recipe import Recipe, RecipeMaterial
from models.production import ProductionOrder
from sqlalchemy.exc import IntegrityError


recipe_bp = Blueprint("recipe", __name__)

@recipe_bp.route("/recipes", methods=["POST"])
def create_recipe():
    data = request.get_json()

    # ✅ Check required fields
    required_fields = ["name", "code", "version", "created_by"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required."}), 400

    # ✅ Create recipe object
    new_recipe = Recipe(
        name=data["name"],
        code=data["code"],
        description=data.get("description"),
        version=data["version"],
        status=data.get("status", "draft"),
        created_by=data["created_by"],
        barcode_id=data.get("barcode_id")
    )

    db.session.add(new_recipe)

    # ✅ Handle duplicate entry or any DB error
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        if "Duplicate entry" in str(e.orig):
            return jsonify({"error": "Duplicate entry: code or barcode_id already exists."}), 400
        return jsonify({"error": "Database error occurred."}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Recipe created successfully!"}), 201



@recipe_bp.route("/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    result = {
        "recipe_id": recipe.recipe_id,
        "name": recipe.name,
        "code": recipe.code,
        "description": recipe.description,
        "version": recipe.version,
        "status": recipe.status,
        "created_by": recipe.created_by,
        "created_at":recipe.created_at,
    }
    return jsonify(result)

@recipe_bp.route("/recipes", methods=["GET"])
def get_recipes():
    recipes = Recipe.query.all()
    result = [
        {
            "recipe_id": recipe.recipe_id,
            "name": recipe.name,
            "code": recipe.code,
            "description": recipe.description,
            "version": recipe.version,
            "status": recipe.status,
            "created_by": recipe.created_by,
            "created_at": recipe.created_at,
        }
        for recipe in recipes
    ]
    return jsonify(result)

@recipe_bp.route("/recipes/<int:recipe_id>", methods=["PUT"])
def update_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"message": "Recipe not found"}), 404

    data = request.get_json()
    recipe.name = data.get("name", recipe.name)
    recipe.code = data.get("code", recipe.code)
    recipe.description = data.get("description", recipe.description)
    recipe.version = data.get("version", recipe.version)
    recipe.status = data.get("status", recipe.status)

    db.session.commit()
    return jsonify({"message": "Recipe updated successfully"}), 200

@recipe_bp.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    try:
        # Step 1: Delete related records in `production_order`
        db.session.query(ProductionOrder).filter(ProductionOrder.recipe_id == recipe_id).delete()
        # Update `recipe_id` to NULL for related `recipe_material` records
        db.session.query(RecipeMaterial).filter(RecipeMaterial.recipe_id == recipe_id).update({RecipeMaterial.recipe_id: None})

        # Step 2: Now delete the recipe
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"message": "Recipe not found"}), 404

        db.session.delete(recipe)
        db.session.commit()  # Commit both deletions
        
        return jsonify({"message": "Recipe deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return jsonify({"error": str(e)}), 500

### 🚀 RECIPE MATERIAL ROUTES ###
@recipe_bp.route("/recipe_materials", methods=["POST"])
def create_recipe_material():
    data = request.get_json()
    new_recipe_material = RecipeMaterial(
        recipe_id=data["recipe_id"],
        material_id=data["material_id"],
        quantity=data["quantity"],
        sequence_number=data["sequence_number"],
    )
    db.session.add(new_recipe_material)
    db.session.commit()
    return jsonify({"message": "Recipe material added successfully!"}), 201

@recipe_bp.route("/recipe_materials/<int:recipe_id>", methods=["GET"])
def get_recipe_materials(recipe_id):
    materials = RecipeMaterial.query.filter_by(recipe_id=recipe_id).all()
    result = [
        {
            "recipe_material_id": mat.recipe_material_id,
            "recipe_id": mat.recipe_id,
            "material_id": mat.material_id,
            "quantity": str(mat.quantity),
            "sequence_number": mat.sequence_number,
        }
        for mat in materials
    ]
    return jsonify(result)

@recipe_bp.route("/recipe_materials/<int:recipe_material_id>", methods=["PUT"])
def update_recipe_material(recipe_material_id):
    material = RecipeMaterial.query.get(recipe_material_id)
    if not material:
        return jsonify({"message": "Recipe material not found"}), 404

    data = request.get_json()
    material.quantity = data.get("quantity", material.quantity)
    material.sequence_number = data.get("sequence_number", material.sequence_number)

    db.session.commit()
    return jsonify({"message": "Recipe material updated successfully"}), 200

@recipe_bp.route("/recipe_materials/<int:recipe_material_id>", methods=["DELETE"])
def delete_recipe_material(recipe_material_id):
    material = RecipeMaterial.query.get(recipe_material_id)
    if not material:
        return jsonify({"message": "Recipe material not found"}), 404

    db.session.delete(material)
    db.session.commit()
    return jsonify({"message": "Recipe material deleted successfully"}), 200
