import { useParams, Link } from "react-router-dom"
import {useFetch} from '@/customHooks/useFetch'
import Markdown from 'react-markdown'
import {
    Layout, Row, Col, Button, InputNumber
} from 'antd'
import ProductBlock from "./ProductBlock"
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import './ProductDetail.scss' 
import { useState } from "react"

const {Content, Sider} = Layout

export default function ProductDetail(){
    const params = useParams()
    const {data, setData} = useFetch(`/products/${params.slug}`)
    let contentBody = data?.attributes?.description?.replaceAll("](/uploads/", "](https://backoffice.nodemy.vn/uploads/")
    let brand = data?.attributes?.idBrand?.data?.attributes?.name
    let categories = data?.attributes?.idCategories?.data
    let queryWithCategories = categories?.reduce((txt, item, index)=>{
        return txt + `&filters[idCategories][slug][$in][${index}]=${item?.attributes?.slug}`
    }, `filters[slug][$ne]=${params.slug}`)

    let categoriesLink = categories?.map(item=>{
        return <Link to={`/danh-muc/${item?.attributes?.slug}`}>{item?.attributes?.name}</Link>
    })

    let imgList = data?.attributes?.image?.data?.map(item=>{
        return {
            original: import.meta.env.VITE_BASE_API_URL + item?.attributes?.url,
            thumbnail: import.meta.env.VITE_BASE_API_URL + item?.attributes?.formats?.thumbnail?.url
        }
    })

    function convertToCurrency(txt){
        let number = Number(txt)
        number = isNaN(number) ? 0 : number
        number = number < 0 ? 0 : number

        return number.toLocaleString('vi', {style:"currency", currency:"VND"})
    }

    return (<>
        <Row gutter={[60, 20]} className="product">
            <Col xs={24} md={18}>
                <h1 className="title">{data?.attributes?.name}</h1>
                <Row gutter={[10, 10]}>
                    <Col xs={24} md={12}>
                        {imgList ? <ImageGallery items={imgList} /> : null}
                    </Col>
                    <Col xs={24} md={12} className="info">
                        <div> 
                            <span className="old-price">{convertToCurrency(data?.attributes?.oldPrice)}</span> 
                            <span className="price">{convertToCurrency(data?.attributes?.price)}</span>
                            <span className="saving-money">Tiết kiệm {convertToCurrency(+data?.attributes?.oldPrice - +data?.attributes?.price)}</span>
                        </div>
                        {
                            categoriesLink ? (
                                <div className="categories-link">
                                    <span className="label-field">Danh mục: </span> {categoriesLink}
                                </div>
                             ) : null
                        }
                        {brand ? <div> <span className="label-field">Thương hiệu: </span> {brand}</div> : null}
                        {data?.attributes?.cpu ? <div> <span className="label-field">CPU: </span> {data?.attributes?.cpu}</div> : null}
                        {data?.attributes?.ram ? <div><span className="label-field">RAM: </span> {data?.attributes?.ram}</div> : null}
                        {data?.attributes?.quantityAvailable ? <div><span className="label-field">Có sẵn: </span> {data?.attributes?.quantityAvailable}</div> : 'Hết hàng'}
                        {data?.attributes?.quantityAvailable ? (<>
                            <div>
                                <span className="label-field">Số lượng: </span>
                                <InputNumber
                                    min={1}
                                    max={data?.attributes?.quantityAvailable || 1}
                                    defaultValue={1}
                                />
                            </div>
                            <div className="btn-wrapper">
                                <Button className="btn" type="primary">Thêm giỏ hàng</Button>
                            </div>
                        </>) : (
                            <div className="btn-wrapper">
                                <Button className="btn" type="primary">Liên hệ ngay</Button>
                            </div>
                        )}
                    </Col>
                </Row>
                <div className="content-body">
                    <h1>Mô tả sản phẩm</h1>
                    <Markdown>
                        {contentBody}
                    </Markdown>
                </div>
                <ProductBlock 
                    title='Sản phẩm liên quan' 
                    query={queryWithCategories}
                    pageSize={4}
                    showButton={false}
                />
            </Col>
            <Col xs={24} md={6} >
                {brand ? 
                    <ProductBlock 
                    query={`filters[idBrand][name]=${brand}&filters[slug][$ne]=${params.slug}`}
                    title="Sản phẩm cùng hãng" 
                    link="/danh-muc/san-pham-moi" 
                    showPagination={false} 
                    showButton={false} 
                    type="column" 
                    pageSize={4}
                    />
                    : 
                    'Khong co san pham nao cung'
                }
            </Col>
        </Row>
        
    </>)
}