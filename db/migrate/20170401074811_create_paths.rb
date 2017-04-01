class CreatePaths < ActiveRecord::Migration[5.0]
  def change
    create_table :paths do |t|
      t.integer :num, null: false
      t.json :style
      t.json :data
      t.references :room, foreign_key: true, null: false
      t.references :user, foreign_key: true, null: false

      t.timestamps
    end

    add_index :paths, [:room_id, :num], unique: true
  end
end
