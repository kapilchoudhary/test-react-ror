class CreateCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :categories do |t|
      t.string :name
      t.json :properties
      t.integer :category_id
      t.string :inherited_categories, array: true
      t.timestamps
    end
  end
end
