class  Api::V1::ProductsController < ApplicationController
  def index
    category = Category.find(params[:id])
    render json: category.descendants_products
  end

  def filter_products
    category = Category.find(params[:id])
    products = category.descendants_products.select{ |p| p.properties[params[:filterType]] == params[:filterValue]}
    render json: products
  end

  def create
    product = Product.create(product_params)
    render json: product
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    render json: { message: 'Successfully Deleted', status: 'OK' }
  end

  def update
    product = Product.find(params[:id])
    product.update_attributes(product_params)
    render json: product
  end

  private

  def product_params
    params.require(:product).permit!
  end
end