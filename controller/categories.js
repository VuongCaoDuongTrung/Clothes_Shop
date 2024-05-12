const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      return res.json({ Categories });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async postAddCategory(req, res) {
    const { cName, cDescription, cStatus } = req.body;
    if (!cName || !cDescription || !cStatus || !req.file) {
      return res.status(400).json({ error: "All fields must be required" });
    }

    let cImage = req.file.filename;
    const filePath = `../backend/public/uploads/categories/${cImage}`;

    try {
      let checkCategoryExists = await categoryModel.findOne({
        cName: toTitleCase(cName),
      });
      if (checkCategoryExists) {
        fs.unlink(filePath, (err) => console.error(err));
        return res.status(409).json({ error: "Category already exists" });
      }

      let newCategory = new categoryModel({
        cName: toTitleCase(cName),
        cDescription,
        cStatus,
        cImage,
      });

      await newCategory.save();
      return res.json({ success: "Category created successfully" });
    } catch (err) {
      console.error(err);
      fs.unlink(filePath, (err) => console.error(err));
      return res.status(500).json({ error: "Server error" });
    }
  }

  async postEditCategory(req, res) {
    const { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.status(400).json({ error: "All fields must be required" });
    }

    try {
      let edit = await categoryModel.findByIdAndUpdate(cId, {
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });

      if (!edit) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.json({ success: "Category edited successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.status(400).json({ error: "Category ID must be provided" });
    }

    try {
      let deletedCategory = await categoryModel.findByIdAndDelete(cId);
      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      const filePath = `../backend/public/uploads/categories/${deletedCategory.cImage}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
        return res.json({ success: "Category deleted successfully" });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
