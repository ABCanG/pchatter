class CreateRooms < ActiveRecord::Migration[5.0]
  def change
    create_table :rooms do |t|
      t.string :name, null: false
      t.string :pass
      t.references :user, index: true, foreign_key: true, null: false

      t.timestamps
    end
  end
end
