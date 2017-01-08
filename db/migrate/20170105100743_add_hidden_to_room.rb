class AddHiddenToRoom < ActiveRecord::Migration[5.0]
  def change
    add_column :rooms, :hidden, :boolean, null: false, default: false
  end
end
