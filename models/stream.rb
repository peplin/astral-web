require 'dm-core'

class Stream
  include DataMapper::Resource
  property :id, Serial
  property :network_uid, String
  property :title, String
  property :description, String
  property :published, Boolean, :default => false 
  property :created_at, DateTime
  property :updated_at, DateTime
end
