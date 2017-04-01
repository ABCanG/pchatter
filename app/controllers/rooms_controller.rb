class RoomsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show, :thumbnail, :base_image]
  before_action :set_room, only: [:show, :edit, :update, :destroy, :thumbnail, :base_image]
  before_action :check_owner, only: [:edit, :update, :destroy]

  # GET /rooms
  # GET /rooms.json
  def index
    @rooms = Room.all
  end

  # GET /rooms/1
  # GET /rooms/1.json
  def show
  end

  # GET /rooms/new
  def new
    @room = Room.new
  end

  # GET /rooms/1/edit
  def edit
  end

  # POST /rooms
  # POST /rooms.json
  def create
    @room = current_user.rooms.new(room_params)

    respond_to do |format|
      if @room.save
        format.html { redirect_to @room, notice: 'ルームを作成しました' }
        format.json { render :show, status: :created, location: @room }
      else
        format.html { render :new }
        format.json { render json: @room.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /rooms/1
  # PATCH/PUT /rooms/1.json
  def update
    respond_to do |format|
      if @room.update(room_params)
        format.html { redirect_to @room, notice: 'ルームを更新しました' }
        format.json { render :show, status: :ok, location: @room }
      else
        format.html { render :edit }
        format.json { render json: @room.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /rooms/1
  # DELETE /rooms/1.json
  def destroy
    @room.destroy
    respond_to do |format|
      format.html { redirect_to root_url, notice: 'ルームを削除しました' }
      format.json { head :no_content }
    end
  end

  def thumbnail
    path = @room.thumbnail_raw_path
    if path.exist?
      expires_in 1.minute
      send_file path, type: 'image/png', disposition: 'inline'
    else
      render_not_found
    end
  end

  def base_image
    path = @room.base_image_raw_path
    if path.exist?
      send_file path, type: 'image/png', disposition: 'inline'
    else
      render_not_found
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_room
    @room = Room.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def room_params
    params.require(:room).permit(:name, :pass, :hidden)
  end

  def check_owner
    raise Forbidden if @room.user_id != current_user.id
  end
end
