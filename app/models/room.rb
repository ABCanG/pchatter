# == Schema Information
#
# Table name: rooms
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  pass       :string(255)
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  hidden     :boolean          default(FALSE), not null
#

class Room < ApplicationRecord
  include Redis::Objects
  hash_key :users
  acts_as_hashids length: 10

  belongs_to :user

  validates :name, presence: true, length: { maximum: 63 }
  validates :pass, length: { maximum: 63 }
  validates :user_id, presence: true

  def thumbnail_raw_path
    Rails.root.join('generated', 'thumbnail', "#{id}.png")
  end

  def base_image_raw_path
    Rails.root.join('generated', 'base_image', "#{id}.png")
  end

  def entrant
    @entrant ||= users.values.map{|data| JSON.parse data, symbolize_names: true}
  end
end
