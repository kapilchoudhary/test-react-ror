class Category < ApplicationRecord
  belongs_to :parent, class_name: 'Category', optional: true, foreign_key: :category_id
  has_many :children, class_name: 'Category', dependent: :destroy
  has_many :products, dependent: :destroy

  def descendants
    self.children | self.children.map(&:descendants).flatten
  end

  def descendants_products
    products = []
    products << self.products
    products << self.descendants.map(&:products).flatten
    products.flatten
  end
end
