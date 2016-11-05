# == Schema Information
#
# Table name: rooms
#
#  id         :integer          not null, primary key
#  name       :string
#  pass       :string
#  hashids    :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryGirl.define do
  factory :room do
    name 'Test Room'
    pass 'test_room'
    hashids 'qawsedrftgyhujikolp'
    user_id 1
  end
end
