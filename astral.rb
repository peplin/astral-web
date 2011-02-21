require 'sinatra'
require 'haml'
require 'sinatra/static_assets'

get '/' do
  haml :index
end
