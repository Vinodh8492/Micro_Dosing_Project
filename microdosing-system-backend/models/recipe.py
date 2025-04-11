from extensions import db, ma  # ✅ Import from extensions


class Recipe(db.Model):
    recipe_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    version = db.Column(db.String(20), nullable=False)
    status = db.Column(db.Enum("active", "inactive", "draft","released","unreleased"), nullable=False, default="draft")
    created_by = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # ✅ New barcode field
    barcode_id = db.Column(db.String(100), unique=True, nullable=True)


class RecipeMaterial(db.Model):
    recipe_material_id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.recipe_id"), nullable=False)
    material_id = db.Column(db.Integer, db.ForeignKey("material.material_id"), nullable=False)
    quantity = db.Column(db.Numeric(10,2), nullable=False)
    sequence_number = db.Column(db.Integer, nullable=False)

class RecipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Recipe
