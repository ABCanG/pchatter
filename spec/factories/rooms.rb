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

FactoryGirl.define do
  factory :room do
    name 'Test Room'
    pass 'test_room'
    hashids 'qawsedrftgyhujikolp'
    user_id 1
  end
end
