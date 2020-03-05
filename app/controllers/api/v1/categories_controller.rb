class  Api::V1::CategoriesController < ApplicationController
  def index
    render json: Category.all
  end

  def create
    category = Category.create(category_params)
    render json: category
  end

  def destroy
    category = Category.find(params[:id])
    Category.where(category_id: category.id).destroy_all
    categories = Category.where('inherited_categories && ARRAY[?]::varchar[]', 13)
    categories.each { |cat| cat.update(inherited_categories: cat.inherited_categories - [category.id.to_s]) }
    category.destroy
    render json: { message: 'Successfully Deleted', status: 'OK' }
  end

  def update
    category = Category.find(params[:id])
    properties_to_remove = {}
    if category_params[:inherited_categories]
      category_params[:inherited_categories] << Category.find_by_category_id(nil).id.to_s
      category_params[:inherited_categories].uniq!
    end
    ids_properties_to_removed = category.inherited_categories - category_params[:inherited_categories]
    if ids_properties_to_removed
      property_array_to_remove = Category.where(id: ids_properties_to_removed).pluck(:properties)
      properties_to_remove = Hash[*property_array_to_remove.collect{|h| h.to_a}.flatten]
    end
    category.update_attributes(category_params)
    property_array = Category.where(id: category_params[:inherited_categories]).pluck(:properties)
    properties = Hash[*property_array.collect{|h| h.to_a}.flatten]
    properties = properties.merge(category.properties) if category.properties
    properties = (properties.to_a - properties_to_remove.to_a).to_h if properties_to_remove.present?
    category.update_attributes(properties: properties)
    render json: category
  end

  def update_properties
    category = Category.find(params[:category_id])
    properties = {}
    category_params[:properties].each {|p| properties[p[:name]] = p[:type] }
    category.update_attributes(properties: properties)
    render json: category.properties
  end

  def get_filters
    category = Category.find(params[:category_id])
    filters = []
    filters = category.properties.keys
    childFilters = Category.find(params[:category_id]).descendants.map(&:properties).map(&:to_a).inject(:&).to_h.keys
    filters = category.properties.keys && childFilters if childFilters.present?
    render json: filters
  end

  private

  def category_params
    params.require(:category).permit!
  end
end
