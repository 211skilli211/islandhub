import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';

export const categoryController = {
    // GET /api/categories - Get all categories with subtypes
    async getAllCategories(req: Request, res: Response) {
        try {
            const withSubtypes = req.query.withSubtypes === 'true';

            if (withSubtypes) {
                const categories = await CategoryModel.getCategoriesWithSubtypes();
                return res.json(categories);
            }

            const categories = await CategoryModel.getAllCategories();
            res.json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    },

    // GET /api/categories/:key - Get category by key
    async getCategoryByKey(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const category = await CategoryModel.getCategoryByKey(key as string);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.json(category);
        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({ error: 'Failed to fetch category' });
        }
    },

    // GET /api/categories/:key/subtypes - Get subtypes for a category
    async getSubtypes(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const subtypes = await CategoryModel.getSubtypesByCategoryKey(key as string);
            res.json(subtypes);
        } catch (error) {
            console.error('Error fetching subtypes:', error);
            res.status(500).json({ error: 'Failed to fetch subtypes' });
        }
    },

    // GET /api/subtypes/:id/form-config - Get form fields for a subtype
    async getFormConfig(req: Request, res: Response) {
        try {
            const subtypeId = parseInt(req.params.id as string);
            const subtype = await CategoryModel.getSubtypeById(subtypeId);

            if (!subtype) {
                return res.status(404).json({ error: 'Subtype not found' });
            }

            const fields = await CategoryModel.getFormFields(subtype.category_id, subtypeId);
            res.json({
                subtype,
                fields
            });
        } catch (error) {
            console.error('Error fetching form config:', error);
            res.status(500).json({ error: 'Failed to fetch form config' });
        }
    },

    // Admin: POST /api/admin/categories - Create category
    async createCategory(req: Request, res: Response) {
        try {
            const category = await CategoryModel.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ error: 'Failed to create category' });
        }
    },

    // Admin: PUT /api/admin/categories/:id - Update category
    async updateCategory(req: Request, res: Response) {
        try {
            const categoryId = parseInt(req.params.id as string);
            const category = await CategoryModel.updateCategory(categoryId, req.body);
            res.json(category);
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ error: 'Failed to update category' });
        }
    },

    // Admin: POST /api/admin/subtypes - Create subtype
    async createSubtype(req: Request, res: Response) {
        try {
            const subtype = await CategoryModel.createSubtype(req.body);
            res.status(201).json(subtype);
        } catch (error) {
            console.error('Error creating subtype:', error);
            res.status(500).json({ error: 'Failed to create subtype' });
        }
    },

    // Admin: PUT /api/admin/subtypes/:id - Update subtype
    async updateSubtype(req: Request, res: Response) {
        try {
            const subtypeId = parseInt(req.params.id as string);
            const subtype = await CategoryModel.updateSubtype(subtypeId, req.body);
            res.json(subtype);
        } catch (error) {
            console.error('Error updating subtype:', error);
            res.status(500).json({ error: 'Failed to update subtype' });
        }
    },

    // Admin: POST /api/admin/form-fields - Create form field
    async createFormField(req: Request, res: Response) {
        try {
            const field = await CategoryModel.createFormField(req.body);
            res.status(201).json(field);
        } catch (error) {
            console.error('Error creating form field:', error);
            res.status(500).json({ error: 'Failed to create form field' });
        }
    }
};
