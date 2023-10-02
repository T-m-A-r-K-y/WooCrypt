import { useBalance } from 'wagmi'
import ListGroup from 'react-bootstrap/ListGroup';
import { useNetwork,useSwitchNetwork } from 'wagmi'
const RecapOrder = ({dollarAmount,address,tokenChain}) => {
    const { data, isError, isLoading } = useBalance({
        address: address,
    })
    if (isLoading) return <ListGroup>
                            <ListGroup.Item>Fetching balance…</ListGroup.Item>
                        </ListGroup>
    if (isError) return <ListGroup>
                            <ListGroup.Item>Error fetching balance</ListGroup.Item>
                        </ListGroup>
    return (
        <ListGroup>
            <ListGroup.Item>Balance: {data?.formatted} {data?.symbol}</ListGroup.Item>
            <ListGroup.Item>Total amount to pay: {dollarAmount}$</ListGroup.Item>
        </ListGroup>
      )
}
export default RecapOrder